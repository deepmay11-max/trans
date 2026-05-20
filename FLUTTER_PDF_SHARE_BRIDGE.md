# Flutter PDF Share Bridge — Implementation Guide

## Overview

The React web app (loaded inside your Flutter WebView) will automatically detect
if it is running inside a Flutter shell. When the user taps **Share**, the web app:

1. Generates the PDF in-browser.
2. Converts it to a **Base64 string**.
3. Sends a JSON message to a JavaScript channel named **`FlutterShareBridge`**.
4. Flutter receives the message, decodes Base64 → temp file, and calls `share_plus`.

---

## Required Flutter Packages

Add these to `pubspec.yaml`:

```yaml
dependencies:
  share_plus: ^7.2.1        # or latest
  path_provider: ^2.1.2     # to get temp directory
```

Run:
```bash
flutter pub get
```

---

## Step-by-Step Flutter Code

### 1. Import packages

```dart
import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:share_plus/share_plus.dart';
import 'package:path_provider/path_provider.dart';
import 'package:webview_flutter/webview_flutter.dart'; // or flutter_inappwebview
```

---

### 2. Setup WebViewController with JavaScript Channel

In the widget that hosts the WebView:

```dart
late final WebViewController _controller;

@override
void initState() {
  super.initState();

  _controller = WebViewController()
    ..setJavaScriptMode(JavaScriptMode.unrestricted)
    ..addJavaScriptChannel(
      'FlutterShareBridge',                // ← EXACT name the web app uses
      onMessageReceived: (JavaScriptMessage message) {
        _handlePdfShare(message.message);  // message.message = the JSON string
      },
    )
    ..loadRequest(Uri.parse('https://your-app-url.com')); // your web app URL
}
```

---

### 3. Handle the PDF Share message

```dart
Future<void> _handlePdfShare(String jsonMessage) async {
  try {
    // 1. Parse the JSON sent by the web app
    final Map<String, dynamic> data = jsonDecode(jsonMessage);
    final String fileName = data['fileName'];     // e.g. "Invoice_Inv-T-2026-53.pdf"
    final String base64Data = data['fileData'];   // raw Base64 (no prefix)
    final String mimeType = data['mimeType'];     // "application/pdf"

    // 2. Decode Base64 → bytes
    final Uint8List fileBytes = base64Decode(base64Data);

    // 3. Save bytes to a temp file
    final Directory tempDir = await getTemporaryDirectory();
    final String filePath = '${tempDir.path}/$fileName';
    final File tempFile = File(filePath);
    await tempFile.writeAsBytes(fileBytes);

    // 4. Share the file using native OS share sheet (share_plus)
    await Share.shareXFiles(
      [XFile(filePath, mimeType: mimeType)],
      subject: fileName,
    );

    // 5. Optional: Delete temp file after sharing
    if (await tempFile.exists()) {
      await tempFile.delete();
    }

  } catch (e) {
    debugPrint('FlutterShareBridge error: $e');
  }
}
```

---

### 4. iOS — WKWebView extra step (if using `flutter_inappwebview`)

If you use `flutter_inappwebview` instead of `webview_flutter`, the channel name
is identical. Just use `userContentController.addScriptMessageHandler`:

```dart
// flutter_inappwebview version
onWebViewCreated: (controller) {
  controller.addJavaScriptHandler(
    handlerName: 'FlutterShareBridge',
    callback: (args) {
      _handlePdfShare(args[0]); // args[0] = JSON string
    },
  );
},
```

On iOS the web app also checks `window.webkit.messageHandlers.FlutterShareBridge`
automatically — no extra configuration needed.

---

## How It Works End-to-End

```
User taps "Share" in Web App
        │
        ▼
React generates PDF (jsPDF + html2canvas)
        │
        ▼
PDF Blob → Base64 string
        │
        ▼
window.FlutterShareBridge.postMessage(JSON)
        │
        ▼  (JavaScript channel)
Flutter: _handlePdfShare(json)
        │
        ▼
base64Decode → write to temp file
        │
        ▼
Share.shareXFiles([XFile(tempPath)])
        │
        ▼
Native OS Share Sheet opens ✅
(WhatsApp, Email, Messages, Drive — all get real PDF)
```

---

## Testing Checklist

- [ ] Android: Share button → native sheet shows PDF ✅
- [ ] Android: WhatsApp receives file as a Document (not text link) ✅
- [ ] iOS: Share button → native sheet shows PDF ✅
- [ ] iOS: WhatsApp / Files receives correctly named PDF ✅
- [ ] Web browser (no Flutter): Falls back to Web Share API / download ✅

---

## Notes

- The **bridge name must be exactly `FlutterShareBridge`** (case-sensitive).
- The web app sends **raw Base64** (no `data:application/pdf;base64,` prefix).
- The web app still has a full fallback for users opening the site in a normal
  browser (Web Share API → download). No existing functionality is affected.
