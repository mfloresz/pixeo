import localforage from 'localforage';

export type ModelType = 'inpaint' | 'superResolution';

export interface Point {
    x: number;
    y: number;
}

export interface Line {
    pts: Point[];
    size?: number;
}

export interface Capabilities {
    webgpu: boolean;
    wasm: boolean;
    simd: boolean;
    threads: boolean;
}

localforage.config({
    name: 'pixeoInpaint',
    storeName: 'models',
});

const MODELS: Record<ModelType, Array<{ name: string; url: string; backupUrl?: string }>> = {
    inpaint: [{
        name: 'migan-pipeline-v2',
        url: 'https://huggingface.co/andraniksargsyan/migan/resolve/main/migan_pipeline_v2.onnx',
        backupUrl: 'https://huggingface.co/lxfater/inpaint-web/resolve/main/migan.onnx',
    }],
    superResolution: [{
        name: 'realesrgan-x4',
        url: 'https://huggingface.co/lxfater/inpaint-web/resolve/main/realesrgan-x4.onnx',
        backupUrl: 'https://worker-share-proxy-01f5.lxfater.workers.dev/lxfater/inpaint-web/resolve/main/realesrgan-x4.onnx',
    }],
};

const modelCache = new Map<ModelType, ArrayBuffer>();
let ortLoaded = false;
let ortLoading: Promise<void> | null = null;

async function loadONNXRuntime(): Promise<void> {
    if (ortLoaded) return;
    if (ortLoading) return ortLoading;

    ortLoading = (async () => {
        console.log('Loading ONNX Runtime Web...');

        const capabilities = await getCapabilities();
        const version = '1.20.1';
        const prefix = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${version}/dist/`;

        let scriptSrc: string;
        if (capabilities.webgpu) {
            scriptSrc = `${prefix}ort.webgpu.min.js`;
        } else if (capabilities.wasm) {
            if (capabilities.simd || capabilities.threads) {
                scriptSrc = `${prefix}ort.wasm.min.js`;
            } else {
                scriptSrc = `${prefix}ort.wasm-core.min.js`;
            }
        } else {
            scriptSrc = `${prefix}ort.min.js`;
        }

        console.log('ONNX Runtime script:', scriptSrc);

        await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = scriptSrc;

            script.onload = () => {
                console.log('ONNX Runtime loaded successfully');
                ortLoaded = true;
                resolve();
            };
            script.onerror = () => {
                console.error('Failed to load ONNX Runtime');
                reject(new Error('Failed to load ONNX Runtime'));
            };

            if (!(window as any).ort) {
                (window as any).ort = {};
            }

            const numThreads = capabilities.threads ? (navigator.hardwareConcurrency || 4) : 1;
            const simdEnabled = capabilities.simd;

            Object.defineProperty((window as any).ort, 'env', {
                value: {
                    wasm: {
                        numThreads,
                        simd: simdEnabled,
                        proxy: true,
                    },
                },
                writable: true,
                configurable: true,
            });

            console.log('ONNX Runtime env configured:', (window as any).ort.env);

            document.head.appendChild(script);
        });
    })();

    return ortLoading;
}

export async function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image from ${url}`));
        img.src = url;
    });
}

export async function getCapabilities(): Promise<Capabilities> {
    const webgpu = !!(navigator as any).gpu && !!(await (navigator as any).gpu.requestAdapter());

    const wasm = typeof WebAssembly === 'object' &&
        typeof WebAssembly.instantiate === 'function';

    const simd = WebAssembly.validate(new Uint8Array([
        0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10,
        1, 8, 0, 65, 0, 253, 15, 253, 98, 11,
    ]));

    let threads = false;
    try {
        if (typeof MessageChannel !== 'undefined') {
            await new MessageChannel().port1.postMessage(new SharedArrayBuffer(1));
            threads = WebAssembly.validate(new Uint8Array([
                0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 5, 4, 1, 3, 1,
                1, 10, 11, 1, 9, 0, 65, 0, 254, 16, 2, 0, 26, 11,
            ]));
        }
    } catch {
        threads = false;
    }

    return { webgpu, wasm, simd, threads };
}

export async function resizeImage(image: HTMLImageElement, width: number, height: number): Promise<HTMLImageElement> {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    ctx.drawImage(image, 0, 0, width, height);

    return new Promise((resolve, reject) => {
        const resized = new Image();
        resized.onload = () => resolve(resized);
        resized.onerror = () => reject(new Error('Failed to load resized image'));
        resized.src = canvas.toDataURL();
    });
}

export async function resizeCanvas(canvas: HTMLCanvasElement, width: number, height: number): Promise<HTMLCanvasElement> {
    const resultCanvas = document.createElement('canvas');
    resultCanvas.width = width;
    resultCanvas.height = height;
    const ctx = resultCanvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    ctx.drawImage(canvas, 0, 0, width, height);
    return resultCanvas;
}

export function drawLines(
    ctx: CanvasRenderingContext2D,
    lines: Line[],
    color = 'rgba(255, 0, 0, 0.5)'
) {
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    lines.forEach(line => {
        if (!line?.pts.length || !line.size) {
            return;
        }
        ctx.lineWidth = line.size;
        ctx.beginPath();
        ctx.moveTo(line.pts[0].x, line.pts[0].y);
        line.pts.forEach(pt => ctx.lineTo(pt.x, pt.y));
        ctx.stroke();
    });
}

export function chwToHwc(uint8Data: Uint8Array, width: number, height: number): Uint8ClampedArray {
    const size = width * height;
    const hwcData = new Uint8ClampedArray(4 * size);

    for (let h = 0; h < height; h++) {
        for (let w = 0; w < width; w++) {
            for (let c = 0; c < 3; c++) {
                const chwIndex = c * size + h * width + w;
                const hwcIndex = (h * width + w) * 4 + c;
                let pixelVal = uint8Data[chwIndex];
                if (pixelVal > 255) pixelVal = 255;
                else if (pixelVal < 0) pixelVal = 0;
                hwcData[hwcIndex] = pixelVal;
            }
            hwcData[(h * width + w) * 4 + 3] = 255;
        }
    }

    return hwcData;
}

export function imageDataToDataURL(imageData: ImageData): string {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
}

export async function processImageWithCanvas(img: HTMLImageElement): Promise<{ data: Uint8Array; width: number; height: number }> {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, img.width, img.height);

    const data = imageData.data;
    const width = img.width;
    const height = img.height;

    const channels = 3;
    const chwData = new Uint8Array(channels * height * width);

    for (let h = 0; h < height; h++) {
        for (let w = 0; w < width; w++) {
            const srcIdx = (h * width + w) * 4;
            for (let c = 0; c < 3; c++) {
                const dstIdx = c * height * width + h * width + w;
                chwData[dstIdx] = data[srcIdx + c];
            }
        }
    }

    return { data: chwData, width, height };
}

export async function processMaskWithCanvas(maskCanvas: HTMLCanvasElement): Promise<Uint8Array> {
    const ctx = maskCanvas.getContext('2d');
    if (!ctx) throw new Error('Could not get mask canvas context');

    const imageData = ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
    const data = imageData.data;
    const width = maskCanvas.width;
    const height = maskCanvas.height;

    const result = new Uint8Array(height * width);

    for (let h = 0; h < height; h++) {
        for (let w = 0; w < width; w++) {
            const srcIdx = (h * width + w) * 4;
            const gray = (data[srcIdx] + data[srcIdx + 1] + data[srcIdx + 2]) / 3;
            result[h * width + w] = gray > 127 ? 0 : 255;
        }
    }

    return result;
}

export async function saveModel(modelType: ModelType, modelBuffer: ArrayBuffer) {
    const modelInfo = MODELS[modelType][0];
    await localforage.setItem(modelInfo.name, modelBuffer);
    modelCache.set(modelType, modelBuffer);
}

export async function loadModel(modelType: ModelType): Promise<ArrayBuffer | null> {
    if (modelCache.has(modelType)) {
        return modelCache.get(modelType)!;
    }

    const modelInfo = MODELS[modelType][0];
    const model = await localforage.getItem(modelInfo.name) as ArrayBuffer | null;
    if (model) {
        modelCache.set(modelType, model);
    }
    return model;
}

export async function modelExists(modelType: ModelType): Promise<boolean> {
    const model = await loadModel(modelType);
    return model !== null;
}

export async function ensureModel(modelType: ModelType): Promise<ArrayBuffer> {
    if (await modelExists(modelType)) {
        const model = await loadModel(modelType);
        if (model) return model;
    }

    const modelInfo = MODELS[modelType][0];
    try {
        const response = await fetch(modelInfo.url);
        if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
        const buffer = await response.arrayBuffer();
        await saveModel(modelType, buffer);
        return buffer;
    } catch (e) {
        if (modelInfo.backupUrl) {
            const response = await fetch(modelInfo.backupUrl);
            if (!response.ok) throw new Error(`Failed to fetch backup: ${response.status}`);
            const buffer = await response.arrayBuffer();
            await saveModel(modelType, buffer);
            return buffer;
        }
        throw e;
    }
}

export async function downloadModel(
    modelType: ModelType,
    onProgress: (progress: number) => void
): Promise<void> {
    if (await modelExists(modelType)) {
        return;
    }

    const modelInfo = MODELS[modelType][0];

    async function downloadFromUrl(url: string): Promise<ArrayBuffer> {
        console.log('Downloading model from:', url);
        onProgress(0);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 600000);

        try {
            const response = await fetch(url, {
                signal: controller.signal,
                redirect: 'follow',
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            if (!response.body) {
                throw new Error('No response body');
            }

            const contentLength = response.headers.get('content-length');
            const totalSize = contentLength ? parseInt(contentLength, 10) : 0;

            console.log('Model size:', totalSize, 'bytes');

            const reader = response.body.getReader();
            const chunks: Uint8Array[] = [];
            let downloaded = 0;
            let lastProgress = 0;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                if (value) {
                    chunks.push(value);
                    downloaded += value.length;

                    if (totalSize > 0) {
                        const progress = (downloaded / totalSize) * 100;
                        if (progress - lastProgress >= 5) {
                            onProgress(progress);
                            lastProgress = progress;
                        }
                    } else {
                        onProgress(Math.min(downloaded / 50000000 * 100, 99));
                    }
                }
            }

            console.log('Download complete:', downloaded, 'bytes');

            const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
            const buffer = new Uint8Array(totalLength);
            let offset = 0;
            for (const chunk of chunks) {
                buffer.set(chunk, offset);
                offset += chunk.length;
            }

            return buffer.buffer as ArrayBuffer;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    try {
        console.log('Downloading from primary URL...');
        const buffer = await downloadFromUrl(modelInfo.url);
        await saveModel(modelType, buffer);
        onProgress(100);
        console.log('Model saved successfully');
    } catch (e) {
        console.error('Primary download failed:', e);
        if (modelInfo.backupUrl) {
            try {
                console.log('Downloading from backup URL...');
                const buffer = await downloadFromUrl(modelInfo.backupUrl);
                await saveModel(modelType, buffer);
                onProgress(100);
                console.log('Model downloaded from backup');
                return;
            } catch (backupError) {
                console.error('Backup download failed:', backupError);
                throw new Error('Failed to download model from all sources');
            }
        }
        throw e;
    }
}

let ortSession: any = null;

export async function inpaint(
    imageFile: File | HTMLImageElement,
    maskCanvas: HTMLCanvasElement,
    onProgress?: (progress: number) => void
): Promise<string> {
    console.log('Starting inpaint process...');

    await loadONNXRuntime();
    console.log('ONNX Runtime loaded');

    const capabilities = await getCapabilities();

    if (!ortSession) {
        console.log('Loading model...');
        const modelBuffer = await ensureModel('inpaint');
        console.log('Model loaded, creating session...');

        ortSession = await (window as any).ort.InferenceSession.create(modelBuffer, {
            executionProviders: [capabilities.webgpu ? 'webgpu' : 'wasm'],
        });
        console.log('Session created');
    }

    if (onProgress) onProgress(5);

    const originalImg = imageFile instanceof HTMLImageElement
        ? imageFile
        : await loadImage(URL.createObjectURL(imageFile));

    const originalWidth = originalImg.width;
    const originalHeight = originalImg.height;

    if (onProgress) onProgress(20);

    const resizedMaskCanvas = await resizeCanvas(maskCanvas, originalWidth, originalHeight);

    const { data: imgData } = await processImageWithCanvas(originalImg);
    const maskData = await processMaskWithCanvas(resizedMaskCanvas);

    if (onProgress) onProgress(40);

    const imageTensor = new (window as any).ort.Tensor('uint8', imgData, [1, 3, originalHeight, originalWidth]);
    const maskTensor = new (window as any).ort.Tensor('uint8', maskData, [1, 1, originalHeight, originalWidth]);

    if (onProgress) onProgress(50);

    console.log('Running inference...');
    const feeds: { [key: string]: any } = {
        [ortSession.inputNames[0]]: imageTensor,
        [ortSession.inputNames[1]]: maskTensor,
    };

    const results = await ortSession.run(feeds);
    const outputTensor = results[ortSession.outputNames[0]];

    if (onProgress) onProgress(80);

    console.log('Processing output...');
    const hwcData = chwToHwc(outputTensor.data as Uint8Array, originalWidth, originalHeight);

    const canvas = document.createElement('canvas');
    canvas.width = originalWidth;
    canvas.height = originalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    const imageDataArray = new Uint8ClampedArray(hwcData.length);
    for (let i = 0; i < hwcData.length; i++) {
        imageDataArray[i] = hwcData[i];
    }
    const tempImageData = new ImageData(imageDataArray, originalWidth, originalHeight);
    ctx.putImageData(tempImageData, 0, 0);
    const result = canvas.toDataURL();

    if (onProgress) onProgress(100);
    console.log('Inpaint complete');

    return result;
}

async function tileProc(
    inputTensor: any,
    session: any,
    callback?: (progress: number) => void
) {
    const inputDims = inputTensor.dims;
    const imageW = inputDims[3];
    const imageH = inputDims[2];

    const rOffset = 0;
    const gOffset = imageW * imageH;
    const bOffset = imageW * imageH * 2;

    const outputDims = [
        inputDims[0],
        inputDims[1],
        inputDims[2] * 4,
        inputDims[3] * 4,
    ];

    const outputData = new Float32Array(
        outputDims[0] * outputDims[1] * outputDims[2] * outputDims[3]
    );

    const outImageW = outputDims[3];
    const outImageH = outputDims[2];
    const outROffset = 0;
    const outGOffset = outImageW * outImageH;
    const outBOffset = outImageW * outImageH * 2;

    const tileSize = 64;
    const tilePadding = 6;
    const tileSizePre = tileSize - tilePadding * 2;

    const tilesx = Math.ceil(inputDims[3] / tileSizePre);
    const tilesy = Math.ceil(inputDims[2] / tileSizePre);

    const data = inputTensor.data as Float32Array;

    const numTiles = tilesx * tilesy;
    let currentTile = 0;

    for (let i = 0; i < tilesx; i++) {
        for (let j = 0; j < tilesy; j++) {
            const tileW = Math.min(tileSizePre, imageW - i * tileSizePre);
            const tileH = Math.min(tileSizePre, imageH - j * tileSizePre);

            const tileROffset = 0;
            const tileGOffset = tileSize * tileSize;
            const tileBOffset = tileSize * tileSize * 2;

            const tileData = new Float32Array(tileSize * tileSize * 3);
            for (let xp = -tilePadding; xp < tileSizePre + tilePadding; xp++) {
                for (let yp = -tilePadding; yp < tileSizePre + tilePadding; yp++) {
                    let xim = i * tileSizePre + xp;
                    if (xim < 0) xim = 0;
                    else if (xim >= imageW) xim = imageW - 1;

                    let yim = j * tileSizePre + yp;
                    if (yim < 0) yim = 0;
                    else if (yim >= imageH) yim = imageH - 1;

                    const idx = xim + yim * imageW;

                    const xt = xp + tilePadding;
                    const yt = yp + tilePadding;

                    tileData[xt + yt * tileSize + tileROffset] = data[idx + rOffset];
                    tileData[xt + yt * tileSize + tileGOffset] = data[idx + gOffset];
                    tileData[xt + yt * tileSize + tileBOffset] = data[idx + bOffset];
                }
            }

            const tile = new (window as any).ort.Tensor('float32', tileData, [
                1,
                3,
                tileSize,
                tileSize,
            ]);

            const r = await session.run({ 'input.1': tile });
            // The output key might vary, but in inpaint project it was '1895'
            const resultOutput = r[Object.keys(r)[0]];

            const outTileSize = tileSize * 4;
            const outTileSizePre = tileSizePre * 4;

            const outTileROffset = 0;
            const outTileGOffset = outTileSize * outTileSize;
            const outTileBOffset = outTileSize * outTileSize * 2;

            const outTileW = tileW * 4;
            const outTileH = tileH * 4;

            for (let x = 0; x < outTileW; x++) {
                for (let y = 0; y < outTileH; y++) {
                    const xim = i * outTileSizePre + x;
                    const yim = j * outTileSizePre + y;
                    const idx = xim + yim * outImageW;
                    const xt = x + tilePadding * 4;
                    const yt = y + tilePadding * 4;

                    outputData[idx + outROffset] =
                        resultOutput.data[xt + yt * outTileSize + outTileROffset];
                    outputData[idx + outGOffset] =
                        resultOutput.data[xt + yt * outTileSize + outTileGOffset];
                    outputData[idx + outBOffset] =
                        resultOutput.data[xt + yt * outTileSize + outTileBOffset];
                }
            }
            currentTile++;
            if (callback) {
                callback(Math.round(100 * (currentTile / numTiles)));
            }
        }
    }

    return { data: outputData, width: outImageW, height: outImageH };
}

function superResolutionPostProcess(floatData: Float32Array, width: number, height: number) {
    const size = width * height;
    const hwcData = new Uint8ClampedArray(size * 4);

    for (let h = 0; h < height; h++) {
        for (let w = 0; w < width; w++) {
            const hwcIndex = (h * width + w) * 4;
            for (let c = 0; c < 3; c++) {
                const chwIndex = c * size + h * width + w;
                const pixelVal = floatData[chwIndex];
                let newPixel = pixelVal;
                if (pixelVal > 1) newPixel = 1;
                else if (pixelVal < 0) newPixel = 0;
                hwcData[hwcIndex + c] = newPixel * 255;
            }
            hwcData[hwcIndex + 3] = 255; // Alpha
        }
    }
    return hwcData;
}

export async function superResolution(
    imageFile: File | HTMLImageElement,
    onProgress?: (progress: number) => void
): Promise<string> {
    console.log('Starting Super Resolution process...');
    await loadONNXRuntime();

    const capabilities = await getCapabilities();

    if (!await modelExists('superResolution')) {
        await downloadModel('superResolution', onProgress || (() => { }));
    }

    const modelBuffer = await ensureModel('superResolution');
    const session = await (window as any).ort.InferenceSession.create(modelBuffer, {
        executionProviders: [capabilities.webgpu ? 'webgpu' : 'wasm'],
    });

    const originalImg = imageFile instanceof HTMLImageElement
        ? imageFile
        : await loadImage(URL.createObjectURL(imageFile));

    const { data: uint8Data, width, height } = await processImageWithCanvas(originalImg);

    // Convert to Float32 CHW and normalize to [0, 1]
    const float32Data = new Float32Array(uint8Data.length);
    for (let i = 0; i < uint8Data.length; i++) {
        float32Data[i] = uint8Data[i] / 255.0;
    }

    const inputTensor = new (window as any).ort.Tensor('float32', float32Data, [1, 3, height, width]);

    // Process using tiling logic
    const { data: outputFloatData, width: outW, height: outH } = await tileProc(inputTensor, session, onProgress);

    // Convert back to HWC for canvas visualization
    const hwcData = superResolutionPostProcess(outputFloatData, outW, outH);

    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    const imageData = new ImageData(hwcData, outW, outH);
    ctx.putImageData(imageData, 0, 0);

    console.log('Super Resolution complete');
    return canvas.toDataURL();
}
