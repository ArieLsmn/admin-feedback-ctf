Environment
DNS name: feedback.admin.local
Application Port: 3075/tcp
SSH Port: 2275/tcp
Blue Team SSH Credentials:
-	Username: analyst
-	Password: blue_team_rocks
________________________________________
Deployment (Proxmox)
Step 1
Create a Linux VM.
Recommended:
•	Debian 12
•	2 GB RAM
•	2 vCPU
•	20 GB Disk
________________________________________
Step 2
Copy the project to the VM.
Example:
git clone 
or
scp -P 2275 scenario75.zip analyst@:/home/analyst
________________________________________
Step 3
Run provisioning.
sudo bash setup-vm.sh
________________________________________
Step 4
Start the lab.
docker compose up -d –build
________________________________________
Step 5
Verify.
Open:
http://:3075
SSH:
ssh analyst@ -p 2275
________________________________________
Red Team Walkthrough Summary
1.	Visit homepage.
2.	Inspect source.
3.	Discover robots.txt.
4.	Discover /api/verify-mfa.
5.	Learn about /dashboard.
6.	Observe pre_mfa_session cookie.
7.	Submit blocked script payload.
8.	Bypass WAF with SVG payload.
9.	Trigger stored XSS.
10.	Steal admin session.
11.	Replay adm_sess cookie.
12.	Access /dashboard.
13.	Capture:
SCENARIO75{RED_C00k13_MFA_Byp4ss_0wn3d}
________________________________________
Blue Team Walkthrough Summary
Logs:
opt/admin/logs/access.log
opt/admin/logs/error.log
Tasks:
1.	Identify attacker IP.
2.	Identify User-Agent.
3.	Identify first WAF block.
4.	Verify dashboard access.
5.	Determine whether MFA endpoint was reached.
6.	Analyze encoded X-Forwarded-For value.
7.	Identify cookie reuse event.
8.	Review authentication bypass anomaly.
Final Blue Team Flag:
SCENARIO75{BLUE_L0G_HUnt3r_M4st3r}

