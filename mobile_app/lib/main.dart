import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:qr_code_scanner/qr_code_scanner.dart';
import 'package:http/http.dart' as http;
import 'package:permission_handler/permission_handler.dart';
import 'package:email_validator/email_validator.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'QR Email Scanner',
      theme: ThemeData.dark().copyWith(
        primaryColor: Colors.blue,
        scaffoldBackgroundColor: Colors.black,
      ),
      home: const QRScannerScreen(),
    );
  }
}

class QRScannerScreen extends StatefulWidget {
  const QRScannerScreen({Key? key}) : super(key: key);

  @override
  _QRScannerScreenState createState() => _QRScannerScreenState();
}

class _QRScannerScreenState extends State<QRScannerScreen> {
  final GlobalKey qrKey = GlobalKey(debugLabel: 'QR');
  QRViewController? controller;
  String scannedEmail = '';
  bool isValidEmail = false;

  @override
  void dispose() {
    controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('QR Email Scanner')),
      body: Column(
        children: [
          Expanded(child: _buildQrView(context)),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                Text(
                  scannedEmail.isEmpty ? 'Scan a QR code' : scannedEmail,
                  style: TextStyle(
                    fontSize: 18,
                    color: isValidEmail ? Colors.green : Colors.white,
                  ),
                ),
                const SizedBox(height: 16),
                if (isValidEmail)
                  ElevatedButton(
                    onPressed: _sendInvitation,
                    child: const Text('Send Invitation'),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQrView(BuildContext context) {
    return QRView(
      key: qrKey,
      onQRViewCreated: _onQRViewCreated,
      overlay: QrScannerOverlayShape(
        borderColor: Colors.blue,
        borderRadius: 10,
        borderLength: 30,
        borderWidth: 10,
        cutOutSize: MediaQuery.of(context).size.width * 0.8,
      ),
    );
  }

  void _onQRViewCreated(QRViewController controller) {
    this.controller = controller;
    controller.scannedDataStream.listen((scanData) {
      setState(() {
        scannedEmail = scanData.code ?? '';
        isValidEmail = EmailValidator.validate(scannedEmail);
        print('Scanned email: $scannedEmail'); // Debug print
        print('Is valid email: $isValidEmail'); // Debug print
      });
    });
  }

  void _sendInvitation() async {
    try {
      final response = await http.post(
        Uri.parse('https://email.excus.us/send-email?email=$scannedEmail'),
      );
      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Invitation sent successfully')),
        );
      } else {
        final errorMessage = _parseErrorMessage(response.body);
        throw Exception('Failed to send invitation: ${response.statusCode} - $errorMessage');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: ${e.toString()}')),
      );
    }
  }

  String _parseErrorMessage(String responseBody) {
    try {
      final jsonResponse = json.decode(responseBody);
      return jsonResponse['error'] ?? 'Unknown error';
    } catch (e) {
      return responseBody;
    }
  }
}