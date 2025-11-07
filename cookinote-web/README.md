# CookiNote 

Dự án **CookiNote Web** là ứng dụng front-end được xây dựng bằng React và Vite.

## Cài đặt

Trước khi chạy dự án, bạn cần cài đặt các dependencies:

npm install

npm install jwt-decode

Sử dụng câu lệnh sau để chạy:
npm run dev

Để chạy app với android studio: 

Bước 0: Cài Node & npm (nếu chưa đúng phiên bản)

Capacitor + Vite yêu cầu Node ≥ 22.12.0
Kiểm tra:

node -v
npm -v


Nếu Node < 22.12 → dùng nvm nâng lên:

nvm install 22.18.0
nvm use 22.18.0

Bước 1: Vào project React + Vite
cd D:\cookinote-fe\cookinote-web

Bước 2: Cài Capacitor Core + CLI
npm install @capacitor/core @capacitor/cli --save

Bước 3: Khởi tạo Capacitor
npx cap init


Name: CookiNote

Package ID: com.kltn.cookinote

Ionic account: n nếu không muốn đăng ký

Bước 4: Cài Android platform
npm install @capacitor/android


Sau đó chạy:

npx cap add android


Lệnh này tạo thư mục android/ chứa project Android.

Bước 5: Build React + Vite
npm run build


Tạo thư mục dist/ chứa web app.

Bước 6: Copy build sang Android
npx cap copy


Đồng bộ nội dung dist/ vào project Android.

Bước 7: Mở Android Studio và chạy app
npx cap open android


Android Studio sẽ mở project.

Chọn Run để chạy trên giả lập hoặc điện thoại thật.

Bước 8: Mỗi lần cập nhật code React

Mỗi lần bạn sửa code web:

npm run build
npx cap copy android
npx cap sync android
npx cap open android


Sau đó Run lại trong Android Studio.
