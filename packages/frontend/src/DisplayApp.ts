import {
  BentleyCloudRpcManager,
  BentleyCloudRpcParams,
  IModelReadRpcInterface,
  IModelTileRpcInterface,
  RenderMode,
  RpcConfiguration,
  SnapshotIModelRpcInterface,
  ViewFlagsProperties,
} from '@itwin/core-common'
import {
  IModelApp,
  IModelConnection,
  ScreenViewport,
  SnapshotConnection,
  StandardViewId,
  ViewCreator3d,
  ViewCreator3dOptions,
  ViewState,
} from '@itwin/core-frontend'
import { ITwinLocalization } from '@itwin/core-i18n'


class AppRpcInterface {
  static get rpcInterfaces() {
    return [
      IModelReadRpcInterface,
      IModelTileRpcInterface,
      SnapshotIModelRpcInterface,
    ]
  }
  
  static initialize() {
    RpcConfiguration.developmentMode = true
    
    const rpcParams: BentleyCloudRpcParams = {
      info: {
        title: 'SimpleViewApp',
        version: 'v1.0',
      },
      pathPrefix: '/api-local',
    }
    
    return BentleyCloudRpcManager.initializeClient(rpcParams, this.rpcInterfaces)
  }
}


export class DisplayApp {
  static async initialize(): Promise<boolean> {
    if (IModelApp.initialized) {
      return true
    }
    AppRpcInterface.initialize()
    
    await IModelApp.startup({
      tileAdmin: {
        cacheTileMetadata: true,
        enableFrontendScheduleScripts: true,
        generateAllPolyfaceEdges: false,
      },
      publicPath: 'iTwin/',
      localization: new ITwinLocalization({
        urlTemplate: `iTwin/locales/{{lng}}/{{ns}}.json`,
      }),
    })
    
    await IModelApp.quantityFormatter.setActiveUnitSystem('metric')
    
    return IModelApp.initialized
  }
  
  static async openLocalIModel(filePath: string): Promise<SnapshotConnection> {
    return SnapshotConnection.openFile(filePath)
  }
  
  static async openView(iModel: IModelConnection, domElmId: string): Promise<ScreenViewport> {
    const container = document.getElementById(domElmId) as HTMLDivElement
    
    const viewState = await this.createViewState(iModel)
    
    const vp = ScreenViewport.create(container, viewState)
    IModelApp.viewManager.addViewport(vp)
    
    return vp
  }
  
  static async setViewFlags(vp: ScreenViewport, changedFlags?: Partial<ViewFlagsProperties>): Promise<void> {
    vp.viewFlags = vp.viewFlags.copy({
      visibleEdges: false,
      renderMode: RenderMode.SmoothShade,
      backgroundMap: false,
      grid: false,
      acsTriad: true,
      lighting: true,
      ...changedFlags,
    })
  }
  
  static async shutdown(deep?: boolean): Promise<void> {
    const list = []
    if (IModelApp.viewManager) {
      for (const vp of IModelApp.viewManager) {
        list.push(async () => {
          await vp.iModel.close()
          return IModelApp.viewManager.dropViewport(vp)
        })
      }
    }
    await Promise.all(list.map(f => f()))
    
    if (deep) {
      await IModelApp.shutdown()
    }
  }
  
  private static async createViewState(iModel: IModelConnection, options?: ViewCreator3dOptions): Promise<ViewState> {
    const viewCreator = new ViewCreator3d(iModel)
    return viewCreator.createDefaultView({
      cameraOn: false,
      skyboxOn: false,
      useSeedView: false,
      allSubCategoriesVisible: true,
      standardViewId: StandardViewId.NotStandard,
      ...options,
    })
  }
  
}
