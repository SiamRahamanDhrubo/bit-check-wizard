# Project Architecture Rules

- Keep the public MCEDIT experience as a lightweight, client-side React site with focused Home, Android APK, and Windows PC pages so downloads remain easy to reach without account gates.
- Keep APK upload passwords and service-role storage access inside the `apk-files` edge function; browser downloads and the local uploader must use narrowly scoped signed URLs.