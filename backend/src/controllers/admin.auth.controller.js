const Admin = require("../models/Admin");
const adminTokenService = require("../services/adminToken.service");
const { hashPassword, verifyPassword } = require("../utils/password");

function normalizeEmail(v) {
  return String(v || "").trim().toLowerCase();
}

function sanitizeOtp(v) {
  return String(v || "").replace(/\D/g, "");
}

function adminDto(admin) {
  return {
    id: String(admin._id),
    role: "admin",
    email: admin.email,
    name: admin.name || "Super Admin",
    phone: admin.phone || "",
    disabled: !!admin.disabled,
  };
}

async function login(req, res, next) {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");

    if (!email || !email.includes("@")) {
      return res.status(400).json({ success: false, message: "Invalid email" });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: "Invalid password" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin || admin.disabled) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const ok = verifyPassword(password, {
      salt: admin.passwordSalt,
      hash: admin.passwordHash,
      iterations: admin.passwordIterations,
    });

    if (!ok) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    admin.lastLoginAt = new Date();
    await admin.save();

    const accessToken = adminTokenService.signAccessToken(admin);
    const { token: refreshToken } = await adminTokenService.issueRefreshToken({
      adminId: admin._id,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    });

    res.cookie("admin_refresh_token", refreshToken, adminTokenService.refreshCookieOptions());

    return res.json({ success: true, accessToken, admin: adminDto(admin) });
  } catch (e) {
    return next(e);
  }
}



async function refresh(req, res, next) {
  try {
    const token = req.cookies?.admin_refresh_token;
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const rotated = await adminTokenService.rotateRefreshToken(token, {
      ip: req.ip,
      userAgent: req.get("user-agent"),
    });

    const admin = await Admin.findById(rotated.adminId);
    if (!admin || admin.disabled) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const accessToken = adminTokenService.signAccessToken(admin);
    res.cookie("admin_refresh_token", rotated.refreshToken, adminTokenService.refreshCookieOptions());

    return res.json({ success: true, accessToken, admin: adminDto(admin) });
  } catch (e) {
    return next(e);
  }
}

async function logout(req, res, next) {
  try {
    const token = req.cookies?.admin_refresh_token;
    if (token) {
      await adminTokenService.revokeRefreshToken(token);
    }
    res.clearCookie("admin_refresh_token", adminTokenService.refreshCookieOptions());
    return res.json({ success: true });
  } catch (e) {
    return next(e);
  }
}

async function me(req, res, next) {
  try {
    const admin = await Admin.findById(req.user?.id);
    if (!admin || admin.disabled) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    return res.json({ success: true, admin: adminDto(admin) });
  } catch (e) {
    return next(e);
  }
}

// Optional helper for controlled environments (not wired by default)
async function setPassword(req, res, next) {
  try {
    const admin = await Admin.findById(req.user?.id);
    if (!admin || admin.disabled) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const password = String(req.body?.password || "");
    if (!password || password.length < 4) {
      return res.status(400).json({ success: false, message: "Invalid password" });
    }
    const h = hashPassword(password);
    admin.passwordSalt = h.salt;
    admin.passwordHash = h.hash;
    admin.passwordIterations = h.iterations;
    await admin.save();
    return res.json({ success: true });
  } catch (e) {
    return next(e);
  }
}

async function changePassword(req, res, next) {
  try {
    const adminId = req.user?.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Missing passwords" });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    // Verify old password
    const ok = verifyPassword(oldPassword, {
      salt: admin.passwordSalt,
      hash: admin.passwordHash,
      iterations: admin.passwordIterations,
    });

    if (!ok) {
      return res.status(401).json({ success: false, message: "Incorrect current password" });
    }

    // Hash new password
    const h = hashPassword(newPassword);
    admin.passwordSalt = h.salt;
    admin.passwordHash = h.hash;
    admin.passwordIterations = h.iterations;

    await admin.save();

    return res.json({ success: true, message: "Password changed successfully" });
  } catch (e) {
    return next(e);
  }
}

module.exports = {
  login,
  refresh,
  logout,
  me,
  setPassword,
  changePassword,
};

