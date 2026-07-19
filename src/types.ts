export type QRType =
  | "url"
  | "wifi"
  | "vcard"
  | "text"
  | "email"
  | "phone"
  | "event"
  | "location"
  | "upi";

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface QR {
  id: string;
  title: string;
  type: QRType;
  url: string; // The encoded data string (URL, text, WiFi string, etc.)
  foregroundColor: string;
  backgroundColor: string;
  size: number;
  margin: number;
  logo?: string; // base64 or custom symbol path
  downloads: number;
  favorites: string[]; // List of user IDs who favorited this QR
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QRFormData {
  title: string;
  type: QRType;
  url: string;
  foregroundColor: string;
  backgroundColor: string;
  size: number;
  margin: number;
  logo?: string;
  // Specific type fields
  wifiSSID?: string;
  wifiPassword?: string;
  wifiEncryption?: "WEP" | "WPA" | "nopass";
  vcardName?: string;
  vcardPhone?: string;
  vcardEmail?: string;
  vcardOrg?: string;
  vcardTitle?: string;
  vcardUrl?: string;
  vcardAddress?: string;
  emailAddress?: string;
  emailSubject?: string;
  emailBody?: string;
  phoneNo?: string;
  eventTitle?: string;
  eventStart?: string;
  eventEnd?: string;
  eventLocation?: string;
  eventDesc?: string;
  lat?: string;
  lng?: string;
  upiId?: string;
  upiName?: string;
  upiAmount?: string;
  upiNote?: string;
  textRaw?: string;
}
