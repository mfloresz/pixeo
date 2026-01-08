# Custom Resolutions Documentation

To define custom resolutions for a model in Pixeo, add a `resolutions` field to the model's configuration in `src/config/models_data.ts`.

## Resolution Object Format

Each resolution entry should follow this structure:

```typescript
{
  id: string,      // Unique identifier, usually "WxH" or "Label"
  label: string,   // Display name in the dropdown (e.g. "1:1 Square")
  width: number,   // Width in pixels (optional if value is used as enum)
  height: number,  // Height in pixels (optional if value is used as enum)
  ratio?: string,  // Aspect ratio label (e.g. "1:1")
  value?: string   // The exact value to send to the API (e.g. "1024*1024" or "480p")
}
```

## Examples

### Separate Width and Height
If the model expects `width` and `height` parameters:
```javascript
'qwen-image': {
  // ...
  resolutions: [
    { id: '1:1', label: '1:1', width: 1328, height: 1328 },
    { id: '16:9', label: '16:9', width: 1664, height: 928 },
  ]
}
```

### Single Resolution Parameter (Enum)
If the model expects a single `resolution` parameter (e.g., `1024x1024` or `1024*1024`):
```javascript
'hidream': {
  // ...
  resolutions: [
    { id: '1024x1024', label: '1024x1024', width: 1024, height: 1024, value: '1024x1024' },
    { id: '768x1360', label: '768x1360', width: 768, height: 1360, value: '768x1360' },
  ]
}
```

## How it works in the UI
1. If a model has the `resolutions` field, the dropdown in the "Generar" tab will list these options exclusively.
2. If no `resolutions` are defined, the application falls back to the default `RESOLUTION_PRESETS` defined in `src/stores/models.ts`.
3. The model store automatically handles whether to send separate `width`/`height` or a single `resolution`/`size` parameter based on the model's metadata.

## Resolutions by Model

Based on the analysis of `src/config/models_data.ts`, the following models define custom resolutions. Each model's resolutions are listed below, including their format and any special notes.

### Image Models

#### z-image-turbo
Uses separate `width` and `height` parameters.
- 1024x1024 - 1:1
- 1152x896 - 9:7
- 896x1152 - 7:9
- 1152x864 - 4:3
- 864x1152 - 3:4
- 1248x832 - 3:2
- 832x1248 - 2:3
- 1280x720 - 16:9
- 720x1280 - 9:16
- 1344x576 - 21:9
- 576x1344 - 9:21
- 1280x1280 - 1:1
- 1440x1120 - 9:7
- 1120x1440 - 7:9
- 1472x1104 - 4:3
- 1104x1472 - 3:4
- 1536x1024 - 3:2
- 1024x1536 - 2:3
- 1536x864 - 16:9
- 864x1536 - 9:16
- 1680x720 - 21:9
- 720x1680 - 9:21
- 1536x1536 - 1:1
- 1728x1344 - 9:7
- 1344x1728 - 7:9
- 1728x1296 - 4:3
- 1296x1728 - 3:4
- 1872x1248 - 3:2
- 1248x1872 - 2:3
- 2048x1152 - 16:9
- 1152x2048 - 9:16
- 2016x864 - 21:9

#### qwen-image
Uses separate `width` and `height` parameters.
- 1328x1328 - 1:1
- 1664x928 - 16:9
- 928x1664 - 9:16
- 1472x1104 - 4:3
- 1104x1472 - 3:4
- 1584x1056 - 3:2
- 1056x1584 - 2:3

#### qwen-image-2512
Same resolutions as qwen-image.
- 1328x1328 - 1:1
- 1664x928 - 16:9
- 928x1664 - 9:16
- 1472x1104 - 4:3
- 1104x1472 - 3:4
- 1584x1056 - 3:2
- 1056x1584 - 2:3

#### hidream
Uses single `resolution` parameter with 'x' format (e.g., "1024x1024"). Note: Width and height dimensions are swapped due to a server-side bug.
- 1024x1024 - 1:1
- 768x1360 - 9:16
- 1360x768 - 16:9
- 880x1168 - 3:4
- 1168x880 - 4:3
- 1248x832 - 3:2
- 832x1248 - 2:3

#### wan2.1-14b
Uses single `resolution` parameter with '*' format (e.g., "1280*720").
- 1280x720 - 16:9
- 720x1280 - 9:16
- 832x480 - 1.73:1
- 480x832 - 1:1.73
- 1024x1024 - 1:1

### Video Models

#### wan2.1-14b-video
Uses single `resolution` parameter with '*' format (e.g., "1280*720").
- 1280x720 - 16:9
- 720x1280 - 9:16
- 832x480 - 1.73:1
- 480x832 - 1:1.73
- 1024x1024 - 1:1

#### wan-2-2-i2v-14b-fast
Uses enum `resolution` parameter (e.g., "480p").
- 480p
- 720p

### Notes
- Models without a `resolutions` field (e.g., hunyuan-image-3, flux-dev, juggernaut-xl, etc.) rely on manual width/height inputs within their defined min/max ranges.
- Video models may have additional constraints like fps, frames, etc., but resolutions are handled similarly.
- Edit models (qwen-image-edit-*) do not define custom resolutions; they use width/height parameters.
- TTS models do not use resolutions.
