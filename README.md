# 一、系統簡介

本專案為一套 Web 財務／消費行為模擬系統，採用前後端分離架構，
前端負責使用者互動介面，後端提供 API 服務並連接 MongoDB 資料庫。

# 二、系統架構

Frontend：Vite + JavaScript

Backend：FastAPI (uvicorn)

Database：MongoDB Atlas


# 三、執行方式（Web 系統執行檔）
##1. 啟動後端（Backend）— Port 8000

後端位於 backend/app，需先設定 MongoDB 連線字串。

Step 1：進入後端目錄
`cd backend/app`

Step 2：設定 MongoDB 環境變數

以下三種方式 擇一即可：

    1. export uri="mongodb+srv://webappgroup5:webappgroup5@cluster0.faxoia9.mongodb.net/"
    2. set MONGODB_URI=mongodb+srv://webappgroup5:webappgroup5@cluster0.faxoia9.mongodb.net/
    3. python -m uvicorn main:app --reload

Step 3：啟動後端服務
`uvicorn main:app --reload --port 8000`

當 Terminal 顯示：
Application startup complete.
代表後端啟動成功。

## 2. 啟動前端（Frontend）— Port 5173
Step 1：回到專案根目錄
`cd /workspaces/webapp_finalproject_finance_simulator`

Step 2：啟動前端服務
`npm run dev`

Terminal 顯示網址後，即可透過瀏覽器進入系統。


# 四、資料庫說明（MongoDB）
1. 安裝 MongoDB Compass
前往官方網站下載
https://www.mongodb.com/try/download/compass

2. 安裝並開啟 MongoDB Compass
點選 Add new connection
貼上以下連線字串：
`mongodb+srv://webappgroup5:webappgroup5@cluster0.faxoia9.mongodb.net/`

即可檢視資料庫內容。


# 五、testing account
acc: 1
pwd:1
