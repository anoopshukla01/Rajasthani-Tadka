#!/usr/bin/env python3
"""
Rajasthani Tadka - High Performance Cinematic Web Server & REST API
Built with Python 3 standard library (no pip dependencies required).
Handles static asset streaming with proper caching, MIME types, CORS,
and live JSON CRUD persistence for the admin portal.
"""

import http.server
import socketserver
import json
import os
import sys
import base64
import time
import urllib.parse
from datetime import datetime

PORT = int(os.environ.get("PORT", 8090))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "data", "site-data.json")
IMAGES_DIR = os.path.join(BASE_DIR, "images")

# Ensure directories exist
os.makedirs(os.path.join(BASE_DIR, "data"), exist_ok=True)
os.makedirs(IMAGES_DIR, exist_ok=True)

def load_data():
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"[Error loading data] {e}", file=sys.stderr)
        return {}

def save_data(data):
    try:
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"[Error saving data] {e}", file=sys.stderr)
        return False

class TadkaRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def end_headers(self):
        # Enable CORS and disable cache on API routes
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def send_json(self, status_code, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def read_json_body(self):
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length > 0:
            raw_body = self.rfile.read(content_length).decode("utf-8")
            return json.loads(raw_body)
        return {}

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == "/api/data":
            data = load_data()
            # Do not expose sensitive auth hash to client
            client_data = dict(data)
            if "admin" in client_data:
                client_data["admin"] = {"configured": True}
            return self.send_json(200, {"success": True, "data": client_data})

        elif path == "/api/media":
            # Return list of all images available in images directory
            try:
                media_files = []
                valid_exts = {".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif"}
                for entry in sorted(os.listdir(IMAGES_DIR)):
                    _, ext = os.path.splitext(entry)
                    if ext.lower() in valid_exts:
                        full_p = os.path.join(IMAGES_DIR, entry)
                        stat = os.stat(full_p)
                        media_files.append({
                            "name": entry,
                            "url": f"images/{entry}",
                            "size": stat.st_size,
                            "mtime": stat.st_mtime
                        })
                return self.send_json(200, {"success": True, "media": media_files})
            except Exception as e:
                return self.send_json(500, {"success": False, "error": f"Failed to list media: {str(e)}"})

        elif path == "/api/dishes":
            data = load_data()
            return self.send_json(200, {"success": True, "dishes": data.get("dishes", [])})

        elif path == "/api/categories":
            data = load_data()
            return self.send_json(200, {"success": True, "categories": data.get("categories", [])})

        elif path == "/api/reservations":
            data = load_data()
            return self.send_json(200, {"success": True, "reservations": data.get("reservations", [])})

        elif path == "/api/ping":
            return self.send_json(200, {"status": "ok", "time": time.time()})

        # Static file serving fallback
        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        try:
            body = self.read_json_body()
        except Exception as e:
            return self.send_json(400, {"success": False, "error": f"Invalid JSON payload: {str(e)}"})

        data = load_data()

        if path == "/api/auth":
            password = body.get("password", "")
            admin_cfg = data.get("admin", {})
            if password == admin_cfg.get("password_hash", "admin123"):
                token = admin_cfg.get("auth_token", "RT_SECRET_TOKEN_2026")
                return self.send_json(200, {"success": True, "token": token, "message": "Authentication successful"})
            else:
                return self.send_json(401, {"success": False, "error": "Invalid administrative passphrase"})

        elif path == "/api/auth/change-password":
            new_pw = body.get("new_password", "").strip()
            if not new_pw or len(new_pw) < 4:
                return self.send_json(400, {"success": False, "error": "Password must be at least 4 characters."})
            data.setdefault("admin", {})["password_hash"] = new_pw
            save_data(data)
            return self.send_json(200, {"success": True, "message": "Admin passphrase updated successfully."})

        elif path == "/api/reservations":
            # Public endpoint for booking a table / royal intake form
            guest_name = body.get("guest_name", "").strip() or "Honoured Guest"
            email = body.get("email", "").strip()
            phone = body.get("phone", "").strip() or (email if email else "Direct Concierge")
            date = body.get("date", "").strip() or datetime.utcnow().strftime("%Y-%m-%d")
            guests = body.get("guests", 2)
            time_slot = body.get("time", "08:00 PM").strip()

            if not email and phone == "Direct Concierge" and not body.get("notes", "").strip():
                return self.send_json(400, {"success": False, "error": "Please provide an email or phone so our host can connect with you."})

            booking_id = f"RT-{int(time.time() * 1000) % 100000:05d}"
            new_res = {
                "id": booking_id,
                "guest_name": guest_name,
                "phone": phone,
                "email": body.get("email", "").strip(),
                "date": date,
                "time": time_slot,
                "guests": int(guests),
                "seating": body.get("seating", "Royal Dining Hall"),
                "notes": body.get("notes", "").strip(),
                "status": "Confirmed",
                "created_at": datetime.utcnow().isoformat() + "Z"
            }

            reservations = data.setdefault("reservations", [])
            reservations.insert(0, new_res)
            save_data(data)
            return self.send_json(201, {"success": True, "reservation": new_res, "booking_id": booking_id})

        elif path == "/api/reservations/status":
            res_id = body.get("id")
            new_status = body.get("status", "Confirmed")
            reservations = data.get("reservations", [])
            found = False
            for r in reservations:
                if r.get("id") == res_id:
                    r["status"] = new_status
                    found = True
                    break
            if found:
                save_data(data)
                return self.send_json(200, {"success": True, "message": f"Reservation {res_id} marked as {new_status}"})
            return self.send_json(404, {"success": False, "error": "Reservation not found"})

        elif path == "/api/dishes":
            action = body.get("action", "save")
            dish_data = body.get("dish", {})

            dishes = data.setdefault("dishes", [])
            dish_id = dish_data.get("id")

            if action == "delete":
                data["dishes"] = [d for d in dishes if d.get("id") != dish_id]
                save_data(data)
                return self.send_json(200, {"success": True, "message": "Dish deleted successfully"})

            elif action == "save":
                if not dish_id:
                    dish_id = f"dish-{int(time.time() * 1000)}"
                    dish_data["id"] = dish_id

                existing_idx = next((i for i, d in enumerate(dishes) if d.get("id") == dish_id), None)
                if existing_idx is not None:
                    dishes[existing_idx] = dish_data
                else:
                    dishes.append(dish_data)

                save_data(data)
                return self.send_json(200, {"success": True, "dish": dish_data, "message": "Dish saved successfully"})

        elif path == "/api/categories":
            action = body.get("action", "save")
            cat_data = body.get("category", {})
            categories = data.setdefault("categories", [])
            cat_id = cat_data.get("id")

            if action == "delete":
                data["categories"] = [c for c in categories if c.get("id") != cat_id]
                save_data(data)
                return self.send_json(200, {"success": True, "message": "Category deleted successfully"})

            elif action == "save":
                if not cat_id:
                    cat_id = f"cat-{int(time.time() * 1000)}"
                    cat_data["id"] = cat_id
                existing_idx = next((i for i, c in enumerate(categories) if c.get("id") == cat_id), None)
                if existing_idx is not None:
                    categories[existing_idx] = cat_data
                else:
                    categories.append(cat_data)
                save_data(data)
                return self.send_json(200, {"success": True, "category": cat_data, "message": "Category saved successfully"})

        elif path == "/api/update-section":
            section_name = body.get("section", "")
            section_data = body.get("data", {})
            if not section_name:
                return self.send_json(400, {"success": False, "error": "Missing section parameter"})

            if isinstance(section_data, dict) and isinstance(data.get(section_name), dict):
                data[section_name] = {**data.get(section_name, {}), **section_data}
            else:
                data[section_name] = section_data

            save_data(data)
            return self.send_json(200, {"success": True, "section": section_name, "data": data[section_name]})

        elif path == "/api/hero":
            hero_data = body.get("hero", {})
            data["hero"] = {**data.get("hero", {}), **hero_data}
            save_data(data)
            return self.send_json(200, {"success": True, "hero": data["hero"]})

        elif path == "/api/restaurant":
            rest_data = body.get("restaurant", {})
            data["restaurant"] = {**data.get("restaurant", {}), **rest_data}
            save_data(data)
            return self.send_json(200, {"success": True, "restaurant": data["restaurant"]})

        elif path == "/api/upload-logo":
            filename = body.get("filename", "logo.png")
            b64data = body.get("data", "")
            if "," in b64data:
                b64data = b64data.split(",", 1)[1]

            try:
                img_bytes = base64.b64decode(b64data)
                _, ext = os.path.splitext(filename)
                if not ext:
                    ext = ".png"
                timestamp = int(time.time())
                safe_name = f"brand_logo_{timestamp}{ext.lower()}"
                target_path = os.path.join(IMAGES_DIR, safe_name)
                with open(target_path, "wb") as f:
                    f.write(img_bytes)

                rel_path = f"images/{safe_name}"
                data.setdefault("restaurant", {})["logo"] = rel_path
                save_data(data)
                return self.send_json(200, {
                    "success": True,
                    "url": rel_path,
                    "message": "Logo uploaded and set as active brand seal!"
                })
            except Exception as e:
                return self.send_json(500, {"success": False, "error": f"Logo upload failed: {str(e)}"})

        elif path == "/api/upload":
            # Handle base64 image uploads from admin
            filename = body.get("filename", f"upload_{int(time.time())}.jpg")
            b64data = body.get("data", "")
            if "," in b64data:
                b64data = b64data.split(",", 1)[1]

            try:
                img_bytes = base64.b64decode(b64data)
                # Keep filename or make clean
                clean_name = os.path.basename(filename).replace(" ", "_")
                base, ext = os.path.splitext(clean_name)
                if not ext:
                    ext = ".jpg"
                timestamp = int(time.time())
                safe_name = f"{base}_{timestamp}{ext.lower()}" if os.path.exists(os.path.join(IMAGES_DIR, clean_name)) else clean_name
                target_path = os.path.join(IMAGES_DIR, safe_name)
                with open(target_path, "wb") as f:
                    f.write(img_bytes)
                rel_path = f"images/{safe_name}"
                return self.send_json(200, {"success": True, "url": rel_path})
            except Exception as e:
                return self.send_json(500, {"success": False, "error": f"Upload failed: {str(e)}"})

        elif path == "/api/backup":
            action = body.get("action", "")
            if action == "restore":
                backup_data = body.get("backup", {})
                if not isinstance(backup_data, dict) or "restaurant" not in backup_data:
                    return self.send_json(400, {"success": False, "error": "Invalid site backup payload"})
                save_data(backup_data)
                return self.send_json(200, {"success": True, "message": "Site data successfully restored from backup!"})
            return self.send_json(400, {"success": False, "error": "Unknown backup action"})

        return self.send_json(404, {"success": False, "error": f"Endpoint not found: {path}"})

    # Enhance MIME types
    extensions_map = http.server.SimpleHTTPRequestHandler.extensions_map.copy()
    extensions_map.update({
        ".svg": "image/svg+xml",
        ".webp": "image/webp",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".css": "text/css",
        ".js": "application/javascript",
        ".json": "application/json",
        ".woff2": "font/woff2",
        ".woff": "font/woff",
        ".ttf": "font/ttf",
    })

def run_server():
    http.server.ThreadingHTTPServer.allow_reuse_address = True
    is_cloud_env = "PORT" in os.environ
    current_port = PORT
    max_attempts = 1 if is_cloud_env else 5
    
    for attempt in range(max_attempts):
        try:
            with http.server.ThreadingHTTPServer(("", current_port), TadkaRequestHandler) as httpd:
                print(f"🌟 Rajasthani Tadka server running at http://0.0.0.0:{current_port}/")
                httpd.serve_forever()
        except OSError as e:
            # 48 on macOS, 98 on Linux (EADDRINUSE)
            if e.errno in (48, 98) and not is_cloud_env:
                print(f"Port {current_port} is busy, trying {current_port + 1}...")
                current_port += 1
            else:
                raise e

if __name__ == "__main__":
    run_server()
