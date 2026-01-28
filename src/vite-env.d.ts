/// <reference types="vite/client" />
declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}

declare module 'fabric' {
    export = fabric;
    export as namespace fabric;
}

declare module 'fabric/*' {
    export = fabric;
    export as namespace fabric;
}
