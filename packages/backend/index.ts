import { IModelHostConfiguration, IModelHostOptions, LocalhostIpcHost, LocalhostIpcHostOpts } from '@itwin/core-backend'
import {
  BentleyCloudRpcManager,
  IModelReadRpcInterface,
  IModelTileRpcInterface,
  RpcConfiguration,
  RpcInterfaceDefinition,
  SnapshotIModelRpcInterface,
} from '@itwin/core-common'
import { WebEditServer } from '@itwin/express-server'


class WebRpcConfiguration {
  static getRpcInterfaces(): RpcInterfaceDefinition[] {
    return [
      IModelReadRpcInterface,
      IModelTileRpcInterface,
      SnapshotIModelRpcInterface,
    ]
  }
  
  static getConfiguration() {
    RpcConfiguration.developmentMode = true
    
    return BentleyCloudRpcManager.initializeImpl(
      {
        info: {
          title: 'SimpleViewApp',
          version: 'v1.0',
        },
      },
      this.getRpcInterfaces(),
    )
  }
}


const createServe = async (): Promise<void> => {
  const opts = {
    iModelHost: {
      ...new IModelHostConfiguration(),
      cacheDir: 'cache',
    } as IModelHostOptions,
    localhostIpcHost: {
      noServer: false,
    } as LocalhostIpcHostOpts,
  }
  
  await LocalhostIpcHost.startup(opts)
  
  const { protocol } = WebRpcConfiguration.getConfiguration()
  
  const expressServer = new WebEditServer(protocol)
  
  await expressServer.initialize(3001)
  
  console.log('http://localhost:3001')
}

createServe().catch((err) => console.log(err))
