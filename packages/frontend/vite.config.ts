import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { Plugin } from 'vite'

// iTwin 当前依赖版本（v3.7.5）对 Vite 支持存在问题，高版本已解决
class StringReplacePlugin implements Plugin {
  public name = StringReplacePlugin.name
  public enforce = 'pre' as const
  
  public transform(code: string, _id: string) {
    return code.replace(
      /const { AzureFrontendStorage, FrontendBlockBlobClientWrapperFactory } = await import\((.+?)\);/s,
      `
        const objectStorage = await import($1);
        const { AzureFrontendStorage, FrontendBlockBlobClientWrapperFactory } = objectStorage.default ?? objectStorage;
      `,
    )
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    new StringReplacePlugin(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/api-local': {
        changeOrigin: true,
        target: 'http://localhost:3001',
        rewrite: (path) => path.replace(/^\/cbe-local/, ''),
      },
    },
    port: 5172,
  },
})
