# MCEDIT Minecraft Downloads Website

## Goal
Replace the current public-facing website with a responsive MCEDIT download experience for Minecraft APKs and Windows PC, using the supplied brief and clearly marking device detection as experimental.

## User experience
- Create a branded homepage with direct navigation to Minecraft APKs and Minecraft for PC.
- Build the APK page with an experimental architecture recommendation, transparent unknown/manual fallback, always-available manual selection, ARM-v8a/armeabi music variants, and installation instructions in a readable modal.
- Build the PC page with the exact requested instructions and Microsoft Store link.
- Use the latest supplied Android APK links. Do not invent a PC download: `MCFWF1.0.zip` is not currently present, so show it as unavailable until the real file is supplied.
- Keep the experience public and remove legacy auth/game/admin routes from the visible app.

## Technical approach
- Replace the app's route tree with focused homepage, APK, PC, and shared navigation pages; keep the existing React/Vite stack and semantic design tokens.
- Detect architecture only in the browser, without storing device information; use User-Agent Client Hints where available and a cautious User-Agent fallback, then leave selection to the visitor.
- Use the project's existing dialog and button components, a dark Minecraft-inspired token palette, and a generated voxel landscape image.
- Verify the primary navigation, manual APK selection, download destinations, instructions dialogs, and responsive layout in the running preview.
