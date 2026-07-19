import { Request, Response } from "express";
import QRCode from "qrcode";
import { DatabaseService, QR } from "../services/db";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";

// Robust helper to sanitize and validate URLs, forcing HTTPS and ensuring safe destination
const sanitizeAndValidateUrl = (input: string): string => {
  if (!input) return "https://google.com";
  let trimmed = input.trim();

  // Guard against XSS or malicious schemes
  const isDangerousProtocol = /^(javascript|data|vbscript|file):/i.test(trimmed);
  if (isDangerousProtocol) {
    return "https://google.com";
  }

  // Add protocol if none is found
  if (!/^[a-zA-Z]+:\/\//i.test(trimmed)) {
    trimmed = "https://" + trimmed;
  }

  // Force HTTPS for a direct, encrypted, secure link
  if (/^http:\/\//i.test(trimmed)) {
    trimmed = "https://" + trimmed.slice(7);
  }

  try {
    const parsedUrl = new URL(trimmed);
    return parsedUrl.toString();
  } catch (err) {
    return "https://google.com";
  }
};

export const QRController = {
  // Generate QR on-the-fly (with optional save if authenticated)
  async generate(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        title,
        type,
        url,
        foregroundColor = "#000000",
        backgroundColor = "#ffffff",
        size = 256,
        margin = 4,
        logo,
      } = req.body;

      if (!url) {
        return res.status(400).json({ error: "QR code content (url/data) is required." });
      }

      // Sanitize and validate URL if it's a web URL type
      let processedUrl = url;
      if (type === "url") {
        processedUrl = sanitizeAndValidateUrl(url);
      }

      // Generate the base QR code data URL using pure JS qrcode package
      // Use Error Correction Level 'H' (High - 30% recovery) by default
      // to ensure logos can be placed in the center without breaking scans.
      const qrDataUrl = await QRCode.toDataURL(processedUrl, {
        color: {
          dark: foregroundColor,
          light: backgroundColor,
        },
        width: size,
        margin: margin,
        errorCorrectionLevel: "H",
      });

      let savedQr: QR | null = null;

      // If user is logged in (req.user exists), let's save the QR config in our database
      if (req.user) {
        savedQr = await DatabaseService.createQR({
          title: title || `Untitled ${(type || "url").toUpperCase()}`,
          type: type || "url",
          url: processedUrl,
          foregroundColor,
          backgroundColor,
          size,
          margin,
          logo,
          userId: req.user.id,
        });
      }

      return res.status(200).json({
        success: true,
        qrDataUrl,
        qr: savedQr,
      });
    } catch (err: any) {
      console.error("QR Code Generation Error:", err);
      return res.status(500).json({ error: "Failed to generate QR code." });
    }
  },

  // Get list of QR codes (with filter and search)
  async getQRs(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required to fetch dashboards." });
      }

      const { search, type } = req.query;
      const qrs = await DatabaseService.findQRs(
        req.user.id,
        search as string,
        type as string
      );

      return res.status(200).json({ success: true, qrs });
    } catch (err: any) {
      console.error("Fetch QRs Error:", err);
      return res.status(500).json({ error: "Failed to fetch QR codes." });
    }
  },

  // Get specific QR details
  async getQRById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const qr = await DatabaseService.findQRById(id);

      if (!qr) {
        return res.status(404).json({ error: "QR Code not found." });
      }

      // Authorization check (only owner can see detail if owner is assigned)
      if (qr.userId && (!req.user || qr.userId !== req.user.id)) {
        return res.status(403).json({ error: "Access denied. This is private." });
      }

      return res.status(200).json({ success: true, qr });
    } catch (err: any) {
      console.error("Fetch QR By Id Error:", err);
      return res.status(500).json({ error: "Failed to fetch QR code." });
    }
  },

  // Update specific QR code settings
  async updateQR(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required." });
      }

      const { id } = req.params;
      const qr = await DatabaseService.findQRById(id);

      if (!qr) {
        return res.status(404).json({ error: "QR Code not found." });
      }

      if (qr.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied. You do not own this." });
      }

      const { title, url, foregroundColor, backgroundColor, size, margin, logo } = req.body;

      // Sanitize and validate URL if it's a web URL type
      let processedUrl = url;
      if (qr.type === "url" && url) {
        processedUrl = sanitizeAndValidateUrl(url);
      }

      const updatedQr = await DatabaseService.updateQR(id, {
        title,
        url: processedUrl,
        foregroundColor,
        backgroundColor,
        size,
        margin,
        logo,
      });

      return res.status(200).json({ success: true, qr: updatedQr });
    } catch (err: any) {
      console.error("Update QR Error:", err);
      return res.status(500).json({ error: "Failed to update QR code." });
    }
  },

  // Delete specific QR code
  async deleteQR(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required." });
      }

      const { id } = req.params;
      const qr = await DatabaseService.findQRById(id);

      if (!qr) {
        return res.status(404).json({ error: "QR Code not found." });
      }

      if (qr.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied. You do not own this." });
      }

      await DatabaseService.deleteQR(id);
      return res.status(200).json({ success: true, message: "QR Code deleted successfully." });
    } catch (err: any) {
      console.error("Delete QR Error:", err);
      return res.status(500).json({ error: "Failed to delete QR code." });
    }
  },

  // Toggle favorite status
  async toggleFavorite(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required." });
      }

      const { id } = req.params;
      const updatedQr = await DatabaseService.toggleFavorite(id, req.user.id);

      if (!updatedQr) {
        return res.status(404).json({ error: "QR Code not found." });
      }

      return res.status(200).json({ success: true, qr: updatedQr });
    } catch (err: any) {
      console.error("Toggle Favorite Error:", err);
      return res.status(500).json({ error: "Failed to toggle favorite." });
    }
  },

  // Increment download stats
  async recordDownload(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updatedQr = await DatabaseService.incrementDownloads(id);

      if (!updatedQr) {
        return res.status(404).json({ error: "QR Code not found." });
      }

      return res.status(200).json({ success: true, qr: updatedQr });
    } catch (err: any) {
      console.error("Increment Download Error:", err);
      return res.status(500).json({ error: "Failed to register download." });
    }
  },
};
