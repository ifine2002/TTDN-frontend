import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { Provider } from 'react-redux'
import { store } from './redux/store.js'
import enUS from 'antd/es/locale/en_US'; 
import { ConfigProvider } from 'antd'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
    <ConfigProvider locale={enUS}
   >
      <App />
    </ConfigProvider>
    </Provider>
  </React.StrictMode>,
)
