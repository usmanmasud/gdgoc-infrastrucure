/*
 * InfraTrack content: curriculum, practice banks, career tracks, resources.
 *
 * Editing tips
 *  - Lab progress is stored by position (e.g. "w3-2"). Add new labs at the END
 *    of a list; don't reorder or delete existing ones mid-semester.
 *  - Quiz `a` is the index of the correct option (0-based).
 *  - Drill `ok` entries are regular expressions matched against the whole
 *    command after trimming, collapsing spaces and removing a leading "sudo ".
 */
window.InfraData = (() => {
  const R = (title, url) => ({ title, url });

  const modules = [
    {
      id: "w1", week: 1, date: "2026-10-08", tag: "Foundations",
      title: "Reboot: Linux Refresher & Bash Scripting",
      summary: "A quick check on last semester's Linux fundamentals, then from typing commands to automating them with Bash.",
      objectives: [
        "Navigate and manage files and directories without thinking about it",
        "Read and change permissions, owners, users and groups",
        "Inspect processes and services with ps, top, systemctl and journalctl",
        "Write Bash scripts with variables, arguments, conditionals, loops and exit codes",
        "Schedule recurring jobs with cron"
      ],
      topics: [
        "Filesystem hierarchy recap: /etc, /var, /home, /usr, /tmp",
        "Permissions: rwx, octal notation, chmod, chown, users & groups",
        "Processes & services: ps, top, kill, systemctl, journalctl",
        "Pipes, redirection, grep, find, wc, sort, uniq",
        "Bash: shebang, variables, $1 $@ $?, if/for/while, functions",
        "Scheduling with cron and crontab syntax"
      ],
      labs: [
        "Set up your lab environment: Ubuntu VM or WSL2, VS Code and a GitHub account",
        "Complete OverTheWire Bandit levels 0–5",
        "Create user 'devops' and group 'infra'; make a shared folder only the group can write to",
        "Write backup.sh that archives a folder into a timestamped .tar.gz file",
        "Schedule backup.sh with cron for 22:00 daily and confirm with crontab -l",
        "Inspect a service: systemctl status ssh, then read its logs with journalctl"
      ],
      challenge: "Write sysreport.sh that prints hostname, uptime, disk usage, memory and the top 5 CPU-hungry processes, then make it runnable from any directory.",
      deliverable: "Create a GitHub repo called campusboard with a scripts/ folder (backup.sh, sysreport.sh) and a README.",
      resources: [
        R("OverTheWire: Bandit", "https://overthewire.org/wargames/bandit/"),
        R("Linux Journey", "https://linuxjourney.com/"),
        R("explainshell — break down any command", "https://explainshell.com/"),
        R("crontab.guru — cron expression editor", "https://crontab.guru/"),
        R("SadServers — fix broken Linux servers", "https://sadservers.com/")
      ],
      quiz: [
        { q: "Which octal mode gives the owner rwx and everyone else read-only?", o: ["777", "744", "755", "700"], a: 1, e: "7 = rwx for the owner, 4 = r-- for group and others. 755 would also give execute." },
        { q: "What does #!/bin/bash on the first line of a script do?", o: ["Comments out the line", "Tells the system which interpreter runs the script", "Makes the file executable", "Imports Bash libraries"], a: 1, e: "The shebang picks the interpreter. You still need chmod +x to make the file executable." },
        { q: "What does $? hold right after a command runs?", o: ["The script's PID", "The number of arguments", "The exit status of the last command", "The last argument"], a: 2, e: "0 means success; anything else is an error code." },
        { q: "Which cron expression runs a job every day at 22:00?", o: ["22 0 * * *", "0 22 * * *", "* 22 * * *", "0 0 22 * *"], a: 1, e: "Fields are minute, hour, day-of-month, month, day-of-week. '* 22' would run every minute of that hour." },
        { q: "Which command shows the logs of the nginx systemd service?", o: ["cat nginx.log", "systemctl logs nginx", "journalctl -u nginx", "ps aux | grep nginx"], a: 2, e: "journalctl -u <unit> reads the journal for one unit." }
      ]
    },
    {
      id: "w2", week: 2, date: "2026-10-15", tag: "Foundations",
      title: "Networking for Cloud Engineers",
      summary: "How a request travels from a browser to a server, and the tools you use when it doesn't arrive.",
      objectives: [
        "Explain the TCP/IP model and what happens when you open a URL",
        "Read IP addresses, private ranges and CIDR blocks",
        "Diagnose problems with ping, dig, curl, ss and traceroute",
        "Serve a website with NGINX and protect it with a firewall"
      ],
      topics: [
        "OSI vs TCP/IP models; TCP vs UDP",
        "IPv4 addressing, private ranges, subnets and CIDR",
        "DNS: A, AAAA, CNAME, MX, TXT records and resolution",
        "Common ports: 22, 53, 80, 443, 3306, 5432",
        "HTTP methods and status codes; HTTPS and TLS",
        "NAT, firewalls, load balancers and reverse proxies"
      ],
      labs: [
        "Find your IP address, default gateway and DNS server (ip a, ip route, resolvectl status)",
        "Run dig google.com, then curl -I https://google.com and explain each header",
        "Use traceroute (or mtr) to count the hops to a website",
        "Install NGINX, serve your own index.html and open it in a browser",
        "Enable ufw: allow SSH and HTTP only, then verify with ss -tulpn",
        "Subnetting drill: split 10.0.0.0/24 into four /26 subnets and list each range"
      ],
      challenge: "Break your NGINX config on purpose (wrong port, missing semicolon), then fix it using nginx -t and /var/log/nginx/error.log.",
      deliverable: "Add CampusBoard v1 (a static HTML events page) to your repo and serve it with NGINX on your Linux machine.",
      resources: [
        R("Cloudflare Learning Center", "https://www.cloudflare.com/learning/"),
        R("MDN: An overview of HTTP", "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview"),
        R("NGINX Beginner's Guide", "https://nginx.org/en/docs/beginners_guide.html"),
        R("cidr.xyz — visual CIDR calculator", "https://cidr.xyz/")
      ],
      quiz: [
        { q: "How many usable host addresses does a /24 network have?", o: ["256", "254", "255", "128"], a: 1, e: "2^8 = 256, minus the network and broadcast addresses." },
        { q: "Which DNS record maps a name to an IPv4 address?", o: ["CNAME", "MX", "A", "TXT"], a: 2, e: "A is IPv4, AAAA is IPv6, CNAME is an alias to another name." },
        { q: "What is the default port for HTTPS?", o: ["80", "8080", "22", "443"], a: 3, e: "HTTP uses 80, HTTPS uses 443." },
        { q: "NGINX returns 502 Bad Gateway. What is the most likely cause?", o: ["The domain name doesn't exist", "The app behind the proxy isn't responding", "The user isn't logged in", "The page was moved"], a: 1, e: "502 means the proxy reached out to its upstream and got no valid response." },
        { q: "Which of these is a private IP address?", o: ["8.8.8.8", "192.168.1.10", "172.217.3.110", "41.58.10.2"], a: 1, e: "Private ranges: 10.0.0.0/8, 172.16.0.0/12 and 192.168.0.0/16." }
      ]
    },
    {
      id: "w3", week: 3, date: "2026-10-22", tag: "Foundations",
      title: "Git & GitHub Collaboration",
      summary: "Version control the way teams actually use it: branches, pull requests, reviews and fixing mistakes.",
      objectives: [
        "Use Git every day: stage, commit, inspect history and compare changes",
        "Branch, merge and resolve conflicts with confidence",
        "Collaborate through forks, pull requests, reviews and issues",
        "Write clear commit messages and READMEs"
      ],
      topics: [
        "Working directory, staging area and repository",
        "Commits, log, diff, show",
        "Branches; merge vs rebase; resolving conflicts",
        "Remotes: clone, fork, fetch, pull, push; SSH keys",
        "Pull requests, code review, issues and GitHub Projects",
        ".gitignore, conventional commits, undoing mistakes (revert, reset, reflog)"
      ],
      labs: [
        "Generate an SSH key and add it to your GitHub account",
        "Complete the 'Introduction Sequence' on Learn Git Branching",
        "Create a feature branch, make 3 commits and open a pull request to main",
        "Create a merge conflict on purpose and resolve it",
        "Team exercise: fork the cluster's shared repo, add your profile card, open a PR and review a teammate's PR",
        "Add a .gitignore and a README with setup instructions to CampusBoard"
      ],
      challenge: "Recover a deleted branch with git reflog, then revert a bad commit that has already been pushed.",
      deliverable: "CampusBoard has a clean history, a README, at least one merged PR and GitHub Issues for the next tasks.",
      resources: [
        R("Learn Git Branching", "https://learngitbranching.js.org/"),
        R("Pro Git (free book)", "https://git-scm.com/book/en/v2"),
        R("GitHub Skills — interactive courses", "https://skills.github.com/"),
        R("GitHub Docs: Get started", "https://docs.github.com/en/get-started")
      ],
      quiz: [
        { q: "Which command stages every change in the current folder?", o: ["git commit -a", "git add .", "git stage --all-files", "git push"], a: 1, e: "git add . stages new, modified and deleted files under the current directory." },
        { q: "git pull is essentially…", o: ["git fetch + git merge", "git push + git fetch", "git clone again", "git reset --hard"], a: 0, e: "pull fetches remote changes and merges (or rebases) them into your branch." },
        { q: "What's the safe way to undo a commit that is already pushed to a shared branch?", o: ["git reset --hard HEAD~1 then force-push", "Delete the repository", "git revert <commit>", "git checkout main"], a: 2, e: "revert adds a new commit that undoes the change without rewriting shared history." },
        { q: "What is a pull request?", o: ["A command that downloads code", "A request to merge one branch into another, with review", "A GitHub billing plan", "A way to delete branches"], a: 1, e: "PRs are where teams discuss, review and test changes before merging." },
        { q: "Which file tells Git which files to leave untracked?", o: [".gitconfig", ".gitkeep", ".gitignore", "README.md"], a: 2, e: "Put build output, secrets (.env) and dependencies in .gitignore." }
      ]
    },
    {
      id: "w4", week: 4, date: "2026-10-29", tag: "Containers",
      title: "Containers with Docker",
      summary: "Package an app and everything it needs into an image that runs the same way on any machine or cloud.",
      objectives: [
        "Explain containers vs virtual machines",
        "Run, inspect, debug and clean up containers",
        "Write small, efficient Dockerfiles",
        "Persist data with volumes and publish ports"
      ],
      topics: [
        "Containers vs VMs; images, layers and tags",
        "docker run, ps, logs, exec, stop, rm, images, rmi",
        "Dockerfile: FROM, WORKDIR, COPY, RUN, ENV, EXPOSE, CMD",
        "Port mapping, volumes and bind mounts",
        ".dockerignore, multi-stage builds, image size and security",
        "Registries: Docker Hub and Artifact Registry"
      ],
      labs: [
        "Install Docker (Docker Desktop or Docker Engine on Ubuntu) and run hello-world",
        "Run NGINX in a container on port 8080 and open it in your browser",
        "Exec into a running container, look around its filesystem, then read its logs",
        "Write a Dockerfile for CampusBoard using nginx:alpine and your static files",
        "Build, tag and run your image; compare the sizes of nginx and nginx:alpine",
        "Push your image to Docker Hub"
      ],
      challenge: "Containerize a small API (Node or Python) with a multi-stage Dockerfile and get the final image under 100 MB.",
      deliverable: "CampusBoard runs anywhere with docker run -p 8080:80 <you>/campusboard.",
      resources: [
        R("Docker: Get started", "https://docs.docker.com/get-started/"),
        R("Play with Docker (browser lab)", "https://labs.play-with-docker.com/"),
        R("Dockerfile reference", "https://docs.docker.com/reference/dockerfile/"),
        R("Docker build best practices", "https://docs.docker.com/build/building/best-practices/")
      ],
      quiz: [
        { q: "What is the key difference between a container and a virtual machine?", o: ["Containers need more RAM", "Containers share the host's kernel", "VMs can't run Linux", "Containers always run in the cloud"], a: 1, e: "VMs virtualize hardware and run a full OS; containers isolate processes on a shared kernel." },
        { q: "What does -p 8080:80 do in docker run?", o: ["Container port 8080 → host port 80", "Host port 8080 → container port 80", "Limits the container to 80% CPU", "Sets the process priority"], a: 1, e: "The format is HOST:CONTAINER." },
        { q: "Which Dockerfile instruction sets the default command when the container starts?", o: ["RUN", "FROM", "CMD", "COPY"], a: 2, e: "RUN executes at build time; CMD sets the runtime default." },
        { q: "You need database files to survive when the container is removed. Use a…", o: ["Volume", "Larger image", "Second CMD", "Different tag"], a: 0, e: "A container's writable layer is deleted with the container; volumes are not." },
        { q: "Why use multi-stage builds?", o: ["To run two containers at once", "To get smaller final images without build tools", "To make builds slower but safer", "They're required by Docker Hub"], a: 1, e: "Build in one stage, copy only the output into a slim runtime stage." }
      ]
    },
    {
      id: "w5", week: 5, date: "2026-11-05", tag: "Containers",
      title: "Multi-Service Apps with Docker Compose",
      summary: "Real apps are frontend + API + database. Describe the whole stack in one file and start it with one command.",
      objectives: [
        "Describe a multi-container app in compose.yaml",
        "Understand container networking and service discovery",
        "Handle configuration and secrets with environment variables",
        "Put a reverse proxy in front of several services"
      ],
      topics: [
        "compose.yaml: services, image/build, ports, volumes, networks, depends_on",
        "Service names as DNS inside a Compose network",
        "Environment variables, .env files and keeping secrets out of Git",
        "Healthchecks and start-up order",
        "Reverse proxy pattern with NGINX",
        "The Twelve-Factor App basics"
      ],
      labs: [
        "Write a compose.yaml that runs NGINX + a simple API + PostgreSQL",
        "Make the API connect to the database by its service name, not localhost",
        "Move database credentials into a .env file and keep it out of Git",
        "Add a named volume so data survives docker compose down",
        "Configure NGINX as a reverse proxy: / → frontend, /api → backend",
        "Add a healthcheck and watch the status with docker compose ps"
      ],
      challenge: "Debug the broken compose file shared at the session (wrong ports, missing env vars, bad network) until the stack runs on your machine.",
      deliverable: "CampusBoard becomes frontend + API + database, started with a single docker compose up.",
      resources: [
        R("Docker Compose docs", "https://docs.docker.com/compose/"),
        R("Awesome Compose examples", "https://github.com/docker/awesome-compose"),
        R("The Twelve-Factor App", "https://12factor.net/")
      ],
      quiz: [
        { q: "Inside a Compose network, how should the api service reach the db service?", o: ["localhost:5432", "db:5432", "127.0.0.1:5432", "Via the public IP"], a: 1, e: "Compose registers each service name in an internal DNS." },
        { q: "What does docker compose down -v also remove?", o: ["Images", "Named volumes, so the data is lost", "The compose.yaml file", "Nothing extra"], a: 1, e: "Use -v carefully; it deletes the volumes declared in the file." },
        { q: "Where should database passwords NOT be stored?", o: ["In a .env file that is git-ignored", "In a secret manager", "Committed in your Git repository", "In CI/CD secrets"], a: 2, e: "Anything committed to Git should be treated as public." },
        { q: "What does depends_on guarantee by default?", o: ["The dependency is fully ready", "Start order only", "Automatic retries", "Shared volumes"], a: 1, e: "Use condition: service_healthy with a healthcheck to wait for readiness." },
        { q: "What does a reverse proxy do?", o: ["Hides your IP from websites you visit", "Receives client requests and forwards them to backend services", "Encrypts your hard drive", "Replaces DNS"], a: 1, e: "NGINX, Cloud Load Balancing and AWS ALB all act as reverse proxies." }
      ]
    },
    {
      id: "w6", week: 6, date: "2026-11-12", tag: "Cloud",
      title: "Google Cloud I: Core Infrastructure",
      summary: "Your first steps on Google Cloud: projects, billing safety, IAM, virtual machines and storage.",
      objectives: [
        "Find your way around the Console, Cloud Shell and the gcloud CLI",
        "Explain regions, zones, projects and billing, and set budget alerts",
        "Apply IAM least privilege with roles and service accounts",
        "Run workloads on Compute Engine and store files in Cloud Storage"
      ],
      topics: [
        "Regions and zones; resource hierarchy (organization → folder → project)",
        "Billing accounts, free tier, credits, budgets and alerts",
        "Cloud Shell and gcloud: config, projects, compute, storage",
        "IAM: principals, roles, service accounts, least privilege",
        "Compute Engine: machine types, disks, SSH, firewall rules",
        "Cloud Storage: buckets, storage classes, public access"
      ],
      labs: [
        "Join the cluster's Google Cloud Skills Boost / Arcade cohort and finish your first lab",
        "Create a project and set a budget alert before creating anything else",
        "In Cloud Shell: gcloud config list, gcloud projects list, set a default region",
        "Create a service account that has only the Storage Object Viewer role",
        "Launch an e2-micro Compute Engine VM, SSH in and install NGINX and Docker",
        "Upload CampusBoard's files to a Cloud Storage bucket and serve them publicly"
      ],
      challenge: "Run CampusBoard's container on your VM, open it via the external IP, then restrict the firewall to ports 22 and 80 only.",
      deliverable: "CampusBoard is live on Google Cloud (VM or Cloud Storage) with the public URL in your README.",
      resources: [
        R("Google Cloud Skills Boost", "https://www.cloudskillsboost.google/"),
        R("Google Cloud Free Program", "https://cloud.google.com/free"),
        R("gcloud CLI overview", "https://cloud.google.com/sdk/gcloud"),
        R("IAM overview", "https://cloud.google.com/iam/docs/overview"),
        R("Compute Engine documentation", "https://cloud.google.com/compute/docs")
      ],
      quiz: [
        { q: "What does the principle of least privilege mean?", o: ["Give everyone Owner so work isn't blocked", "Grant only the permissions needed for the task", "Use as few projects as possible", "Never use service accounts"], a: 1, e: "Smaller permissions mean a smaller blast radius when something leaks." },
        { q: "How do a region and a zone relate?", o: ["A zone contains several regions", "They are the same thing", "A zone is a deployment area within a region", "Regions are only for storage"], a: 2, e: "For example, region us-central1 has zones us-central1-a, -b, -c and -f." },
        { q: "What is a service account?", o: ["A billing account", "An identity used by apps and VMs rather than people", "A support plan", "An admin's personal account"], a: 1, e: "Workloads authenticate as service accounts, with their own IAM roles." },
        { q: "The first thing to do in a new project to avoid surprise bills:", o: ["Create a large VM to test", "Set a budget and alerts", "Enable every API", "Make all buckets public"], a: 1, e: "Budgets don't stop spending automatically, but alerts tell you early." },
        { q: "Which command sets the default project for gcloud?", o: ["gcloud project use ID", "gcloud config set project ID", "gcloud init --project", "gcloud set default ID"], a: 1, e: "gcloud config set project PROJECT_ID." }
      ]
    },
    {
      id: "w7", week: 7, date: "2026-11-19", tag: "Cloud",
      title: "Google Cloud II: Serverless, Data & the AWS Map",
      summary: "Ship containers without managing servers, use a managed database, watch it in production, and learn to read any cloud.",
      objectives: [
        "Deploy containers to Cloud Run and understand scaling to zero",
        "Use Cloud SQL as a managed PostgreSQL database",
        "Design a simple VPC with firewall rules",
        "Monitor uptime and read logs",
        "Translate every Google Cloud service you use to AWS and Azure"
      ],
      topics: [
        "Cloud Run: services, revisions, concurrency, scaling to zero",
        "Artifact Registry for container images",
        "Cloud SQL (PostgreSQL) and connecting to it securely",
        "VPC networks, subnets and firewall rules",
        "Cloud Logging, Cloud Monitoring, uptime checks and alerts",
        "Concept map: Compute Engine ↔ EC2, Cloud Storage ↔ S3, Cloud Run ↔ App Runner/Lambda, Cloud SQL ↔ RDS"
      ],
      labs: [
        "Push your API image to Artifact Registry",
        "Deploy the API to Cloud Run and get a public HTTPS URL",
        "Create a Cloud SQL PostgreSQL instance (smallest tier) and connect the API to it",
        "Create a custom VPC with one subnet and a firewall rule allowing only HTTP and SSH",
        "Add an uptime check with an email alert for your Cloud Run URL",
        "Fill in the Google Cloud ↔ AWS ↔ Azure map for every service CampusBoard uses",
        "Clean up: delete Cloud SQL and unused VMs to protect your credits"
      ],
      challenge: "AWS mirror: on the AWS Free Tier, host CampusBoard with an EC2 instance or an S3 bucket, and write down 5 differences you noticed.",
      deliverable: "CampusBoard's API runs on Cloud Run backed by Cloud SQL, and the README has an architecture diagram plus the AWS mapping.",
      resources: [
        R("Cloud Run quickstarts", "https://cloud.google.com/run/docs/quickstarts"),
        R("Cloud SQL for PostgreSQL", "https://cloud.google.com/sql/docs/postgres"),
        R("Compare AWS and Azure services to Google Cloud", "https://cloud.google.com/docs/get-started/aws-azure-gcp-service-comparison"),
        R("AWS Free Tier", "https://aws.amazon.com/free/")
      ],
      quiz: [
        { q: "When a Cloud Run service gets no traffic it can…", o: ["Scale to zero, so you pay for nothing", "Keep 10 instances running", "Delete itself", "Switch to a VM"], a: 0, e: "Request-based billing plus scale-to-zero makes Cloud Run cheap for student projects." },
        { q: "What is the AWS equivalent of Cloud Storage?", o: ["EBS", "S3", "RDS", "EC2"], a: 1, e: "Object storage: Cloud Storage ↔ S3 ↔ Azure Blob Storage." },
        { q: "What is the AWS equivalent of Cloud SQL?", o: ["DynamoDB", "Redshift", "RDS", "Lambda"], a: 2, e: "Managed relational databases: Cloud SQL ↔ RDS ↔ Azure SQL." },
        { q: "Where do you store container images on Google Cloud?", o: ["Cloud Storage only", "Artifact Registry", "Cloud SQL", "BigQuery"], a: 1, e: "Artifact Registry stores Docker images and language packages." },
        { q: "What does an uptime check do?", o: ["Speeds up your app", "Probes your endpoint regularly and alerts when it fails", "Counts users", "Restarts VMs every hour"], a: 1, e: "You find out about downtime before your users tell you." }
      ]
    },
    {
      id: "w8", week: 8, date: "2026-11-26", tag: "Automation",
      title: "Automation: CI/CD & Infrastructure as Code",
      summary: "Every push builds, tests and deploys itself, and your cloud setup lives in code you can recreate with one command.",
      objectives: [
        "Explain continuous integration and continuous delivery/deployment",
        "Write GitHub Actions workflows with jobs, steps and secrets",
        "Build, push and deploy a container automatically",
        "Describe infrastructure in Terraform and use init, plan, apply and destroy"
      ],
      topics: [
        "CI/CD concepts: pipelines, stages and quality gates",
        "GitHub Actions: workflows, triggers, jobs, steps, runners, secrets",
        "Pipeline: build → test → push image → deploy",
        "Authenticating to Google Cloud from CI (keys vs Workload Identity Federation)",
        "Infrastructure as Code and why it matters",
        "Terraform: providers, resources, variables, outputs, state"
      ],
      labs: [
        "Create a workflow that lints and tests your code on every push",
        "Add a job that builds your Docker image and pushes it to Artifact Registry",
        "Deploy to Cloud Run automatically from GitHub Actions using repository secrets",
        "Install Terraform and write a main.tf that creates a Cloud Storage bucket",
        "Run terraform init, plan and apply, then destroy, and read the state file",
        "Add a workflow status badge to your README"
      ],
      challenge: "Use Terraform to create Week 6's VM and firewall rule with one terraform apply, using variables for the region and machine type.",
      deliverable: "Every push to main redeploys CampusBoard automatically, with no manual steps.",
      resources: [
        R("GitHub Actions documentation", "https://docs.github.com/en/actions"),
        R("Deploying to Cloud Run from GitHub Actions", "https://github.com/google-github-actions/deploy-cloudrun"),
        R("Terraform: Get started with Google Cloud", "https://developer.hashicorp.com/terraform/tutorials/gcp-get-started"),
        R("Terraform: Get started with AWS", "https://developer.hashicorp.com/terraform/tutorials/aws-get-started")
      ],
      quiz: [
        { q: "What does CI stand for?", o: ["Cloud Infrastructure", "Continuous Integration", "Container Image", "Code Inspection"], a: 1, e: "Every change is automatically built and tested when it's merged." },
        { q: "Where do GitHub Actions workflow files live?", o: [".github/workflows/", "/workflows", ".actions/", "ci/github.yml"], a: 0, e: "Any .yml file in .github/workflows/ is picked up." },
        { q: "How should a workflow get Google Cloud credentials?", o: ["Hard-code the key in the YAML", "Repository secrets or Workload Identity Federation", "Put it in the README", "Email it to the team"], a: 1, e: "Workload Identity Federation avoids long-lived keys entirely." },
        { q: "What does terraform plan do?", o: ["Creates resources", "Shows the changes Terraform would make without making them", "Deletes the state", "Installs Terraform"], a: 1, e: "Always read the plan before apply." },
        { q: "What is the Terraform state file?", o: ["A log of your terminal", "The record mapping your config to real cloud resources", "A backup of your code", "Your cloud password"], a: 1, e: "Protect it; in teams, keep it in a remote backend like a GCS bucket." }
      ]
    },
    {
      id: "w9", week: 9, date: "2026-12-03", tag: "Career",
      title: "Capstone Sprint & Career Launch",
      summary: "Teams ship a real project end to end, and everyone turns their work into a portfolio, CV and next-step plan.",
      objectives: [
        "Deliver a team project using issues, PRs and reviews",
        "Draw and explain a cloud architecture",
        "Present your skills through a portfolio, CV and LinkedIn",
        "Choose your next certification and learning path"
      ],
      topics: [
        "Team roles and workflow on GitHub Projects",
        "Architecture diagrams and writing an excellent README",
        "Portfolio, CV and LinkedIn for cloud and DevOps roles",
        "Certifications: Cloud Digital Leader, Associate Cloud Engineer, AWS Cloud Practitioner",
        "Interview basics: Linux, networking, Git and Docker questions; the STAR method"
      ],
      labs: [
        "Form a team of 4–6, pick a capstone idea and set up a GitHub Project board",
        "Draw your architecture diagram (draw.io or Excalidraw)",
        "Containerize every service and deploy to Cloud Run",
        "Wire up CI/CD so main deploys automatically",
        "Update your CV and LinkedIn with your CampusBoard and capstone links",
        "Pick a career track on this site and set your next certification target"
      ],
      challenge: "Mock interview: in pairs, ask each other 5 questions from the Interview bank on the Practice page, under 2 minutes per answer.",
      deliverable: "Capstone deployed publicly with a README, architecture diagram and CI/CD badge.",
      resources: [
        R("roadmap.sh: DevOps", "https://roadmap.sh/devops"),
        R("Google Cloud certifications", "https://cloud.google.com/learn/certification"),
        R("AWS Certified Cloud Practitioner", "https://aws.amazon.com/certification/certified-cloud-practitioner/"),
        R("Excalidraw", "https://excalidraw.com/")
      ],
      quiz: [
        { q: "What is the strongest evidence of your skills for a recruiter?", o: ["A list of tools on your CV", "A public repo with a working live link, README and clean history", "A screenshot of a course", "The number of GitHub followers"], a: 1, e: "Show, don't tell: something they can open and click." },
        { q: "Which Google certification covers cloud concepts for beginners and non-engineers?", o: ["Professional Cloud Architect", "Cloud Digital Leader", "Professional Data Engineer", "Associate Cloud Engineer"], a: 1, e: "Cloud Digital Leader is foundational; Associate Cloud Engineer is the hands-on next step." },
        { q: "Which Google certification is the hands-on, engineer-level first step?", o: ["Associate Cloud Engineer", "Cloud Digital Leader", "Professional Cloud DevOps Engineer", "Professional Cloud Security Engineer"], a: 0, e: "ACE tests deploying and operating workloads on Google Cloud." },
        { q: "STAR in interviews stands for…", o: ["Skills, Tools, Achievements, Results", "Situation, Task, Action, Result", "Start, Test, Apply, Review", "Strategy, Team, Action, Review"], a: 1, e: "Use it for 'tell me about a time when…' questions." },
        { q: "A great project README includes…", o: ["Only the project name", "What it is, the architecture, how to run and deploy it, and a live link", "Your exam results", "Only screenshots"], a: 1, e: "Write it for a stranger who has 60 seconds." }
      ]
    },
    {
      id: "w10", week: 10, date: "2026-12-10", tag: "Career",
      title: "Demo Day & Graduation",
      summary: "Teams present what they built, we celebrate, and everyone leaves with a plan for the break and beyond.",
      objectives: [
        "Present a technical project clearly in 7 minutes",
        "Answer questions about your architecture and trade-offs",
        "Reflect on the semester and set your next goal"
      ],
      topics: [
        "Demo format: 7-minute demo + 3 minutes of Q&A per team",
        "Judging rubric: working deployment, architecture, automation, documentation, teamwork",
        "Certificates, badges and recognition",
        "Holiday learning plan and next semester's advanced track"
      ],
      labs: [
        "Rehearse your demo at least twice and time it",
        "Prepare a 5-slide deck: problem, architecture, demo, challenges, what's next",
        "Present at Demo Day",
        "Submit your final project link and reflection below",
        "Write a LinkedIn post about what you built and tag GDGoC BUK",
        "Pick your holiday learning plan on the Career page"
      ],
      challenge: "Judges' bonus question: explain in 60 seconds how you would rebuild your architecture on AWS.",
      deliverable: "Final project link + a short reflection on what you learned and what's next.",
      resources: [
        R("Google Cloud Skills Boost", "https://www.cloudskillsboost.google/"),
        R("Kubernetes basics tutorial", "https://kubernetes.io/docs/tutorials/kubernetes-basics/"),
        R("Killercoda — free interactive labs", "https://killercoda.com/")
      ],
      quiz: [
        { q: "Which command lists running containers?", o: ["docker images", "docker ps", "docker run", "docker logs"], a: 1, e: "Add -a to include stopped containers." },
        { q: "Which Google Cloud service runs containers without you managing servers?", o: ["Compute Engine", "Cloud Run", "Cloud Storage", "Cloud DNS"], a: 1, e: "Cloud Run is serverless containers." },
        { q: "chmod 600 secret.txt gives…", o: ["Everyone full access", "Owner read/write only", "Owner execute only", "Group read only"], a: 1, e: "6 = rw- for the owner, 0 for group and others. Common for SSH keys." },
        { q: "What does git revert do differently from git reset?", o: ["Nothing", "It adds a new commit that undoes changes instead of rewriting history", "It deletes the repo", "It only works offline"], a: 1, e: "That's why revert is safe on shared branches." },
        { q: "What does terraform destroy do?", o: ["Deletes the Terraform binary", "Deletes every resource managed by the configuration", "Deletes only the state file", "Formats your code"], a: 1, e: "Great for cost control after labs." }
      ]
    }
  ];

  const tags = {
    Foundations: "blue",
    Containers: "green",
    Cloud: "yellow",
    Automation: "red",
    Career: "blue"
  };

  const setup = [
    "Laptop with Ubuntu, WSL2 (Windows) or a Linux VM",
    "VS Code with the Remote - SSH / WSL and Docker extensions",
    "Git installed and configured (user.name, user.email)",
    "GitHub account with a profile README",
    "Docker Desktop or Docker Engine",
    "Google Cloud account (free trial or credits) with a budget alert",
    "Google Cloud Skills Boost account (linked to the cluster cohort)",
    "AWS Free Tier account (optional, for Week 7)",
    "Joined the cluster's community channel"
  ];

  // ---------- Practice: command drills ----------
  const drillCats = ["Linux", "Networking", "Git", "Docker", "Cloud", "Terraform"];
  const D = (id, cat, task, ok, hint, sol) => ({ id, cat, task, ok, hint, sol });
  const drills = [
    D("l1", "Linux", "Print the directory you are currently in.", ["pwd"], "Three letters: print working directory.", "pwd"),
    D("l2", "Linux", "List all files, including hidden ones, in long format.", ["ls (-la|-al|-l -a|-a -l|-lA|-Al|-alh|-lah|-hla)"], "ls with two flags: one for long format, one for all.", "ls -la"),
    D("l3", "Linux", "Create the nested directories projects/campusboard/scripts in one command.", ["mkdir -p (\\./)?projects/campusboard/scripts/?"], "mkdir needs a flag to create parents.", "mkdir -p projects/campusboard/scripts"),
    D("l4", "Linux", "Make backup.sh executable.", ["chmod (u\\+x|\\+x|a\\+x|ug\\+x|7[0-7]{2}) (\\./)?backup\\.sh"], "chmod with +x.", "chmod +x backup.sh"),
    D("l5", "Linux", "Show every line containing 'error' (ignore case) in /var/log/syslog.", ["grep -i ['\"]?error['\"]? /var/log/syslog", "grep ['\"]?error['\"]? -i /var/log/syslog", "grep --ignore-case ['\"]?error['\"]? /var/log/syslog"], "grep has a flag for case-insensitive matching.", "grep -i error /var/log/syslog"),
    D("l6", "Linux", "Show the last 20 lines of app.log.", ["tail (-n ?20|-20|--lines=20) app\\.log"], "The opposite of head.", "tail -n 20 app.log"),
    D("l7", "Linux", "Follow app.log live as new lines are written.", ["tail (-f|-F|--follow) app\\.log"], "tail with a 'follow' flag.", "tail -f app.log"),
    D("l8", "Linux", "Recursively change the owner of /srv/www to user devops and group infra.", ["chown -R devops:infra /srv/www/?", "chown devops:infra -R /srv/www/?", "chown --recursive devops:infra /srv/www/?"], "chown user:group with the recursive flag.", "sudo chown -R devops:infra /srv/www"),
    D("l9", "Linux", "Show disk space on all mounted filesystems in human-readable form.", ["df -h", "df -H"], "Disk free, human readable.", "df -h"),
    D("l10", "Linux", "Show a human-readable total of how much space the logs folder uses.", ["du -sh (\\./)?logs/?", "du -hs (\\./)?logs/?"], "Disk usage with summary and human flags.", "du -sh logs"),
    D("l11", "Linux", "Count the number of lines in users.txt.", ["wc -l users\\.txt", "wc -l < users\\.txt", "cat users\\.txt \\| wc -l"], "Word count has a lines flag.", "wc -l users.txt"),
    D("l12", "Linux", "Check whether the nginx service is running (systemd).", ["systemctl status nginx(\\.service)?"], "systemctl + status.", "systemctl status nginx"),
    D("l13", "Linux", "Restart nginx using systemd.", ["systemctl restart nginx(\\.service)?"], "systemctl + restart.", "sudo systemctl restart nginx"),
    D("l14", "Linux", "Read the logs of the ssh service from the systemd journal.", ["journalctl -u (ssh|sshd)(\\.service)?( -f| -e| --no-pager)*", "journalctl --unit[= ](ssh|sshd)(\\.service)?"], "journalctl with a unit flag.", "journalctl -u ssh"),
    D("l15", "Linux", "Forcefully kill the process with PID 4321.", ["kill (-9|-KILL|-SIGKILL|-s KILL|-s SIGKILL|-s 9) 4321"], "kill with signal 9.", "kill -9 4321"),
    D("l16", "Linux", "Edit your user's crontab.", ["crontab -e"], "crontab with the edit flag.", "crontab -e"),
    D("l17", "Linux", "Create a new user called devops with a home directory.", ["useradd (-m|--create-home)( -s /bin/bash)? devops", "useradd( -s /bin/bash)? -m devops", "adduser devops"], "useradd -m or adduser.", "sudo useradd -m devops"),
    D("l18", "Linux", "Find every .sh file under the current directory.", ["find \\. (-type f )?-i?name ['\"]?\\*\\.sh['\"]?( -type f)?"], "find . -name with a quoted wildcard.", "find . -name \"*.sh\""),
    D("l19", "Linux", "Print the value of the PATH environment variable.", ["echo \\$PATH", "echo \"\\$PATH\"", "echo \\$\\{PATH\\}", "printenv PATH"], "echo a variable with $.", "echo $PATH"),

    D("n1", "Networking", "Look up the A record for google.com with dig.", ["dig (A )?google\\.com( A)?( \\+short)?", "dig \\+short google\\.com( A)?"], "dig followed by the domain.", "dig google.com A"),
    D("n2", "Networking", "Fetch only the HTTP response headers of https://example.com with curl.", ["curl (-s )?(-I|--head|-sI|-Is) (-s )?https://example\\.com/?"], "curl has a 'head' flag.", "curl -I https://example.com"),
    D("n3", "Networking", "Send exactly 4 ping packets to 8.8.8.8.", ["ping -c ?4 8\\.8\\.8\\.8", "ping 8\\.8\\.8\\.8 -c ?4"], "ping with a count flag.", "ping -c 4 8.8.8.8"),
    D("n4", "Networking", "List all listening TCP and UDP ports with the owning processes, numerically.", ["(ss|netstat) -(?=[tulpn]*t)(?=[tulpn]*u)(?=[tulpn]*l)(?=[tulpn]*p)(?=[tulpn]*n)[tulpn]{5}"], "ss with t, u, l, p and n.", "ss -tulpn"),
    D("n5", "Networking", "Show your machine's IP addresses.", ["ip a", "ip addr( show)?", "ip address( show)?", "hostname -I", "ifconfig"], "The modern tool is 'ip'.", "ip a"),
    D("n6", "Networking", "Test the NGINX configuration for syntax errors.", ["nginx -t"], "nginx with a test flag.", "sudo nginx -t"),
    D("n7", "Networking", "Allow HTTP through the ufw firewall.", ["ufw allow (80|http|80/tcp|'Nginx HTTP'|\"Nginx HTTP\")"], "ufw allow …", "sudo ufw allow 80/tcp"),
    D("n8", "Networking", "SSH into 34.120.10.5 as the user student.", ["ssh student@34\\.120\\.10\\.5", "ssh -l student 34\\.120\\.10\\.5"], "ssh user@host.", "ssh student@34.120.10.5"),

    D("g1", "Git", "Initialize a new Git repository in the current folder.", ["git init"], "git + init.", "git init"),
    D("g2", "Git", "Create and switch to a new branch called feature/navbar.", ["git checkout -b feature/navbar", "git switch -c feature/navbar", "git switch --create feature/navbar"], "checkout -b or switch -c.", "git switch -c feature/navbar"),
    D("g3", "Git", "Commit the staged changes with the message: Add navbar", ["git commit -m ['\"]Add navbar['\"]", "git commit --message[= ]['\"]Add navbar['\"]"], "git commit -m \"…\"", "git commit -m \"Add navbar\""),
    D("g4", "Git", "Show the commit history, one line per commit.", ["git log --oneline( --graph| --all| --decorate)*", "git log( --graph| --all| --decorate)* --oneline( --graph| --all| --decorate)*"], "git log with a one-line flag.", "git log --oneline"),
    D("g5", "Git", "Push feature/navbar to origin and set it as the upstream branch.", ["git push (-u|--set-upstream) origin feature/navbar"], "git push -u origin <branch>.", "git push -u origin feature/navbar"),
    D("g6", "Git", "Safely undo the last (already pushed) commit by creating a new commit.", ["git revert (HEAD|@)( --no-edit)?", "git revert --no-edit (HEAD|@)"], "Not reset: the other one.", "git revert HEAD"),
    D("g7", "Git", "Clone https://github.com/octocat/Hello-World.git", ["git clone https://github\\.com/octocat/Hello-World(\\.git)?/?"], "git clone <url>.", "git clone https://github.com/octocat/Hello-World.git"),
    D("g8", "Git", "Show which files are modified, staged or untracked.", ["git status( -s| -sb| --short)?"], "Ask git for its status.", "git status"),

    D("d1", "Docker", "List the running containers.", ["docker ps", "docker container (ls|list|ps)"], "docker ps.", "docker ps"),
    D("d2", "Docker", "List all containers, including stopped ones.", ["docker ps (-a|--all)", "docker container (ls|list|ps) (-a|--all)"], "docker ps with the 'all' flag.", "docker ps -a"),
    D("d3", "Docker", "Run nginx in the background, mapping host port 8080 to container port 80.", ["docker (container )?run (?=(.* )?(-d|--detach|-dp)( |$))(?=(.* )?(-p|--publish|-dp) 8080:80( |$))(.+ )?nginx(:\\S+)?"], "docker run with detach and publish flags. Format is HOST:CONTAINER.", "docker run -d -p 8080:80 nginx"),
    D("d4", "Docker", "Build an image from the Dockerfile in the current folder, tagged campusboard:v1.", ["docker (image )?build (-t|--tag) campusboard:v1 \\.", "docker (image )?build \\. (-t|--tag) campusboard:v1", "docker buildx build (-t|--tag) campusboard:v1 \\."], "docker build -t name:tag <context>.", "docker build -t campusboard:v1 ."),
    D("d5", "Docker", "Open an interactive shell inside the running container named web.", ["docker (container )?exec -(it|ti) web (sh|bash|/bin/sh|/bin/bash)"], "docker exec with -it and a shell.", "docker exec -it web sh"),
    D("d6", "Docker", "Show the logs of the container web and keep following them.", ["docker (container )?logs (-f|--follow) web", "docker (container )?logs web (-f|--follow)"], "docker logs with a follow flag.", "docker logs -f web"),
    D("d7", "Docker", "Start every service in compose.yaml in the background.", ["docker[ -]compose up (-d|--detach)"], "compose up with detach.", "docker compose up -d"),
    D("d8", "Docker", "Stop and remove the Compose stack and its named volumes.", ["docker[ -]compose down (-v|--volumes)"], "compose down with the volumes flag.", "docker compose down -v"),
    D("d9", "Docker", "Remove all stopped containers, unused networks and dangling images.", ["docker system prune( -f)?", "docker system prune --force"], "docker system …", "docker system prune"),

    D("c1", "Cloud", "Set the default gcloud project to campusboard-dev.", ["gcloud config set project campusboard-dev"], "gcloud config set …", "gcloud config set project campusboard-dev"),
    D("c2", "Cloud", "List your Compute Engine VM instances.", ["gcloud compute instances list"], "gcloud compute <resource> list.", "gcloud compute instances list"),
    D("c3", "Cloud", "Create a Cloud Storage bucket named gs://campusboard-assets.", ["gcloud storage buckets create gs://campusboard-assets/?( --location[= ]\\S+)?", "gsutil mb( -l \\S+)? gs://campusboard-assets/?"], "gcloud storage buckets create …", "gcloud storage buckets create gs://campusboard-assets"),
    D("c4", "Cloud", "Copy index.html into the bucket gs://campusboard-assets.", ["(gcloud storage|gsutil) cp index\\.html gs://campusboard-assets/?(index\\.html)?"], "gcloud storage cp <src> <dest>.", "gcloud storage cp index.html gs://campusboard-assets"),
    D("c5", "Cloud", "Deploy the source code in the current folder to Cloud Run as a service named campusboard.", ["gcloud run deploy campusboard --source[= ]\\.( --[a-z-]+(=\\S+| [^-\\s]\\S*)?)*"], "gcloud run deploy <name> --source .", "gcloud run deploy campusboard --source . --region us-central1 --allow-unauthenticated"),
    D("c6", "Cloud", "List your Cloud Run services.", ["gcloud run services list( --region[= ]\\S+)?"], "gcloud run services …", "gcloud run services list"),
    D("c7", "Cloud", "List your S3 buckets with the AWS CLI.", ["aws s3 ls", "aws s3api list-buckets"], "aws s3 …", "aws s3 ls"),

    D("t1", "Terraform", "Initialize a Terraform working directory and download providers.", ["terraform init( -upgrade)?"], "The first command in any Terraform project.", "terraform init"),
    D("t2", "Terraform", "Preview the changes Terraform would make.", ["terraform plan( -out[= ]\\S+)?"], "Look before you apply.", "terraform plan"),
    D("t3", "Terraform", "Create or update the infrastructure.", ["terraform apply( -auto-approve)?( \\S+\\.tfplan)?"], "terraform …", "terraform apply"),
    D("t4", "Terraform", "Delete every resource managed by the current configuration.", ["terraform destroy( -auto-approve)?"], "The opposite of apply.", "terraform destroy")
  ];

  // ---------- Practice: flashcards ----------
  const C = (id, deck, front, back) => ({ id, deck, front, back });
  const cards = [
    C("m1", "Cloud map", "Virtual machines", "Google Cloud: Compute Engine · AWS: EC2 · Azure: Virtual Machines"),
    C("m2", "Cloud map", "Object storage", "Google Cloud: Cloud Storage · AWS: S3 · Azure: Blob Storage"),
    C("m3", "Cloud map", "Serverless containers", "Google Cloud: Cloud Run · AWS: App Runner / ECS Fargate · Azure: Container Apps"),
    C("m4", "Cloud map", "Functions (FaaS)", "Google Cloud: Cloud Run functions · AWS: Lambda · Azure: Functions"),
    C("m5", "Cloud map", "Managed Kubernetes", "Google Cloud: GKE · AWS: EKS · Azure: AKS"),
    C("m6", "Cloud map", "Managed relational DB", "Google Cloud: Cloud SQL · AWS: RDS · Azure: Azure SQL"),
    C("m7", "Cloud map", "Private network", "Google Cloud: VPC · AWS: VPC · Azure: Virtual Network"),
    C("m8", "Cloud map", "Identity & access", "Google Cloud: IAM · AWS: IAM · Azure: Entra ID + RBAC"),
    C("m9", "Cloud map", "Monitoring", "Google Cloud: Cloud Monitoring · AWS: CloudWatch · Azure: Monitor"),
    C("m10", "Cloud map", "DNS", "Google Cloud: Cloud DNS · AWS: Route 53 · Azure: DNS"),
    C("m11", "Cloud map", "Load balancing", "Google Cloud: Cloud Load Balancing · AWS: Elastic Load Balancing · Azure: Load Balancer"),
    C("m12", "Cloud map", "Container registry", "Google Cloud: Artifact Registry · AWS: ECR · Azure: Container Registry"),

    C("k1", "Concepts", "IaaS vs PaaS vs SaaS", "IaaS: you rent servers (Compute Engine). PaaS: you bring code, they run it (Cloud Run, App Engine). SaaS: finished software (Gmail)."),
    C("k2", "Concepts", "DevOps", "A culture and set of practices that bring development and operations together to ship changes quickly and reliably through automation, measurement and shared ownership."),
    C("k3", "Concepts", "CIDR /16 vs /24", "/16 = 65,536 addresses (e.g. 10.0.0.0/16). /24 = 256 addresses. A smaller number after the slash means a bigger network."),
    C("k4", "Concepts", "Container image vs container", "An image is the read-only template (like a class). A container is a running instance of it (like an object)."),
    C("k5", "Concepts", "Idempotent", "Running it once or ten times gives the same result. Terraform apply and good Bash scripts aim for this."),
    C("k6", "Concepts", "High availability", "Designing so the service keeps working when a component fails, e.g. running in multiple zones behind a load balancer."),
    C("k7", "Concepts", "Horizontal vs vertical scaling", "Horizontal: add more machines/instances. Vertical: make one machine bigger."),
    C("k8", "Concepts", "SLI, SLO, SLA", "SLI: what you measure (latency). SLO: your target (99.9% < 300 ms). SLA: the promise to customers, with penalties."),
    C("k9", "Concepts", "Stateless service", "Keeps no user data in memory or on local disk between requests, so any instance can serve any request. Required for Cloud Run scaling."),
    C("k10", "Concepts", "Reverse proxy", "Sits in front of servers, receives client requests and forwards them. Adds TLS, routing, caching and load balancing."),
    C("k11", "Concepts", "Blue/green deployment", "Run the new version (green) next to the old (blue) and switch traffic when it's healthy, so rollback is instant."),
    C("k12", "Concepts", "Shift-left security", "Catching security problems early: scanning code, dependencies and images in CI instead of after deployment.")
  ];

  // ---------- Practice: interview questions ----------
  const interview = [
    { id: "i1", t: "Linux", q: "What happens when you type a URL into a browser and press Enter?", a: "DNS resolves the name to an IP (cache → resolver → root/TLD/authoritative), the browser opens a TCP connection (and a TLS handshake for HTTPS), sends an HTTP request, the server (often behind a load balancer/reverse proxy) responds, and the browser renders HTML and fetches CSS/JS/images." },
    { id: "i2", t: "Linux", q: "A server is slow. How do you investigate?", a: "Check load and CPU (uptime, top/htop), memory (free -h), disk space and I/O (df -h, iostat), network (ss, ping), then application logs (journalctl, /var/log). Work from symptoms to the specific process." },
    { id: "i3", t: "Linux", q: "Explain chmod 755 and when you'd use it.", a: "Owner rwx (7), group r-x (5), others r-x (5). Typical for scripts, binaries and web directories that others need to read and execute but not modify." },
    { id: "i4", t: "Linux", q: "What is the difference between a process and a thread?", a: "A process has its own memory space; threads are execution units inside a process that share its memory. Processes are isolated, threads are lighter but need synchronization." },
    { id: "i5", t: "Networking", q: "TCP vs UDP?", a: "TCP is connection-oriented, reliable and ordered (HTTP, SSH). UDP is connectionless and faster with no delivery guarantee (DNS queries, video calls, gaming)." },
    { id: "i6", t: "Networking", q: "What is the difference between a load balancer and a reverse proxy?", a: "A reverse proxy forwards client requests to backend servers (can add TLS, caching, routing). A load balancer is a reverse proxy whose main job is distributing traffic across many backends with health checks." },
    { id: "i7", t: "Networking", q: "What is NAT and why is it used?", a: "Network Address Translation rewrites private IPs to a public IP at the edge, so many private machines share one public address and aren't directly reachable from the internet." },
    { id: "i8", t: "Git", q: "Merge vs rebase?", a: "Merge combines histories with a merge commit and preserves exactly what happened. Rebase replays your commits on top of another branch for a linear history. Don't rebase shared/public branches." },
    { id: "i9", t: "Git", q: "You committed a secret to GitHub. What do you do?", a: "Rotate/revoke the secret immediately (assume it's compromised), remove it from history (git filter-repo or BFG) and force-push, add it to .gitignore, and use a secret manager or CI secrets from then on." },
    { id: "i10", t: "Docker", q: "Why are containers useful compared to installing apps directly on servers?", a: "They package the app with its dependencies, so it runs the same everywhere; they start fast, are isolated, are easy to version and roll back, and are the unit that Cloud Run, Kubernetes and CI/CD work with." },
    { id: "i11", t: "Docker", q: "How do you make a Docker image smaller?", a: "Use slim/alpine or distroless base images, multi-stage builds, a .dockerignore, combine RUN steps and clean caches, and only copy what the app needs at runtime." },
    { id: "i12", t: "Docker", q: "What's the difference between CMD and ENTRYPOINT?", a: "ENTRYPOINT sets the executable that always runs; CMD provides default arguments (or a default command) that can be overridden at docker run." },
    { id: "i13", t: "Cloud", q: "When would you choose Cloud Run over Compute Engine?", a: "For stateless HTTP services or jobs packaged as containers: no server management, automatic scaling (to zero), pay per use. Choose Compute Engine when you need full OS control, special software, GPUs or long-running stateful processes." },
    { id: "i14", t: "Cloud", q: "How do you keep cloud costs under control as a student?", a: "Budgets and alerts, the free tier, smallest machine types, scale-to-zero services, deleting resources after labs (terraform destroy), and labels to see what is spending." },
    { id: "i15", t: "Cloud", q: "Explain IAM roles and service accounts with an example.", a: "A role is a set of permissions; you grant roles to principals. Example: the Cloud Run service runs as a service account that only has roles/cloudsql.client and roles/storage.objectViewer, nothing more." },
    { id: "i16", t: "DevOps", q: "Describe a CI/CD pipeline you would build.", a: "On every PR: lint, test, build the image. On merge to main: build, scan, push to Artifact Registry, deploy to staging, run smoke tests, then deploy to production, with secrets from the CI secret store or Workload Identity Federation." },
    { id: "i17", t: "DevOps", q: "What is Infrastructure as Code and why does it matter?", a: "Defining infrastructure in version-controlled files (Terraform). It's repeatable, reviewable through PRs, documents itself, and lets you recreate or destroy environments with one command." },
    { id: "i18", t: "DevOps", q: "Your deployment broke production. What do you do?", a: "Communicate, roll back to the last good version first (restore service), then investigate with logs and metrics, fix forward with a test that catches it, and write a blameless post-mortem." },
    { id: "i19", t: "Behavioural", q: "Tell me about a technical problem you solved (use STAR).", a: "Situation: the context. Task: what you had to do. Action: the specific steps you took (commands, debugging, decisions). Result: the outcome, ideally measurable, and what you learned. Your CampusBoard project is a great source." },
    { id: "i20", t: "Behavioural", q: "Why cloud / DevOps?", a: "Be specific and honest: what you enjoyed building, a moment it clicked, and where you want to grow. Mention projects and what you learned, not just tool names." }
  ];

  // ---------- Career tracks ----------
  const careers = [
    {
      id: "cloud", name: "Cloud Engineer", color: "blue",
      blurb: "Design, build and operate infrastructure on Google Cloud, AWS or Azure.",
      roles: ["Cloud Engineer", "Cloud Support Engineer", "Junior Cloud Architect"],
      skills: ["Networking & VPC design", "IAM & security basics", "Compute, storage, databases", "Terraform", "Cost management"],
      steps: [
        "Complete Google Cloud Skills Boost: Google Cloud Computing Foundations",
        "Earn the Google Cloud Digital Leader certification",
        "Rebuild CampusBoard entirely with Terraform on Google Cloud",
        "Prepare for and book the Associate Cloud Engineer exam",
        "Build the same architecture on AWS and write a comparison blog post"
      ],
      certs: ["Google Cloud Digital Leader", "Associate Cloud Engineer", "AWS Certified Cloud Practitioner", "AWS Solutions Architect – Associate"]
    },
    {
      id: "devops", name: "DevOps Engineer", color: "green",
      blurb: "Automate how software is built, tested, shipped and run.",
      roles: ["DevOps Engineer", "Build & Release Engineer", "Platform Engineer"],
      skills: ["CI/CD pipelines", "Docker & Kubernetes", "Terraform", "Scripting (Bash, Python)", "Monitoring"],
      steps: [
        "Add tests, linting and image scanning to CampusBoard's pipeline",
        "Learn Kubernetes basics on Killercoda or Minikube",
        "Deploy CampusBoard to GKE Autopilot with a Helm chart",
        "Set up Prometheus + Grafana for your app",
        "Aim for KCNA, then CKAD or the Terraform Associate exam"
      ],
      certs: ["Associate Cloud Engineer", "Kubernetes and Cloud Native Associate (KCNA)", "HashiCorp Terraform Associate", "Professional Cloud DevOps Engineer (later)"]
    },
    {
      id: "sre", name: "Site Reliability Engineer", color: "red",
      blurb: "Keep systems fast and available using software engineering.",
      roles: ["SRE", "Production Engineer", "Infrastructure Engineer"],
      skills: ["Deep Linux & networking", "Observability: metrics, logs, traces", "Incident response", "Python or Go", "Capacity planning"],
      steps: [
        "Read Google's free SRE book chapters on SLOs and incident response",
        "Solve 10 challenges on SadServers",
        "Define SLIs/SLOs and alerts for CampusBoard in Cloud Monitoring",
        "Write a Python or Go tool that automates something you do by hand",
        "Run a game day: break your app, recover it, write a post-mortem"
      ],
      certs: ["Associate Cloud Engineer", "Linux Foundation Certified SysAdmin (LFCS)", "Professional Cloud DevOps Engineer (later)"]
    },
    {
      id: "security", name: "Cloud Security / DevSecOps", color: "yellow",
      blurb: "Protect cloud systems: identities, networks, data and the software supply chain.",
      roles: ["Cloud Security Analyst", "DevSecOps Engineer", "Security Engineer"],
      skills: ["IAM & least privilege", "Network security", "Vulnerability scanning", "Logging & detection", "Compliance basics"],
      steps: [
        "Audit CampusBoard's IAM: remove every permission it doesn't need",
        "Add Trivy (image scanning) and Dependabot to your pipeline",
        "Play cloud CTFs (e.g. flaws.cloud) and write up what you learned",
        "Learn the OWASP Top 10 and secure one endpoint of your API",
        "Study for CompTIA Security+ or Google Cloud security courses"
      ],
      certs: ["CompTIA Security+", "Google Cloud Digital Leader", "Professional Cloud Security Engineer (later)"]
    },
    {
      id: "builder", name: "Backend / Full-stack Builder", color: "blue",
      blurb: "Build products and ship them yourself, with cloud skills as your superpower.",
      roles: ["Backend Developer", "Full-stack Developer", "Startup founder"],
      skills: ["An API framework (Express, FastAPI, Django)", "Databases", "Docker & Cloud Run", "Firebase", "CI/CD"],
      steps: [
        "Pick one backend language and framework and stick with it",
        "Build a real API for a campus problem and deploy it on Cloud Run",
        "Add authentication with Firebase Auth",
        "Automate deploys with GitHub Actions",
        "Ship it to real users and collect feedback"
      ],
      certs: ["Associate Cloud Engineer", "Professional Cloud Developer (later)"]
    },
    {
      id: "explore", name: "Still Exploring", color: "green",
      blurb: "Not sure yet? That's fine. Build broad foundations and try things out.",
      roles: ["Any of the above, once you've tried them"],
      skills: ["Linux", "Networking", "Git", "Docker", "One cloud"],
      steps: [
        "Finish every lab in this semester's roadmap",
        "Complete one Google Cloud Arcade game per month",
        "Try one mini project from each track above",
        "Talk to a working engineer at a cluster guest talk",
        "Pick a track by the start of next semester"
      ],
      certs: ["Google Cloud Digital Leader", "AWS Certified Cloud Practitioner"]
    }
  ];

  const resourceGroups = [
    { title: "Official learning platforms", items: [
      R("Google Cloud Skills Boost", "https://www.cloudskillsboost.google/"),
      R("Google Cloud documentation", "https://cloud.google.com/docs"),
      R("Google Developer Program", "https://developers.google.com/profile"),
      R("AWS Skill Builder", "https://skillbuilder.aws/"),
      R("Microsoft Learn: Azure fundamentals", "https://learn.microsoft.com/training/azure/")
    ]},
    { title: "Practice playgrounds", items: [
      R("OverTheWire: Bandit (Linux)", "https://overthewire.org/wargames/bandit/"),
      R("SadServers (troubleshooting)", "https://sadservers.com/"),
      R("Learn Git Branching", "https://learngitbranching.js.org/"),
      R("Play with Docker", "https://labs.play-with-docker.com/"),
      R("Killercoda (Kubernetes, Linux)", "https://killercoda.com/")
    ]},
    { title: "Roadmaps & references", items: [
      R("roadmap.sh: DevOps", "https://roadmap.sh/devops"),
      R("Google SRE books (free)", "https://sre.google/books/"),
      R("The Twelve-Factor App", "https://12factor.net/"),
      R("explainshell", "https://explainshell.com/"),
      R("Google Cloud ↔ AWS ↔ Azure comparison", "https://cloud.google.com/docs/get-started/aws-azure-gcp-service-comparison")
    ]}
  ];

  const community = [
    { name: "Weekly session", when: "Thursdays", what: "Concept → live demo → hands-on lab → challenge → assignment briefing." },
    { name: "Lab Nights", when: "Weekly, drop-in", what: "Bring what's broken; mentors help you debug and finish labs." },
    { name: "Skills Boost Study Jams", when: "Monthly", what: "Complete Google Cloud labs and Arcade games together." },
    { name: "Deployment Fridays", when: "Fridays", what: "Ship something to production and post the link in the channel." },
    { name: "Mini Hackathon", when: "Mid-November", what: "4–6 hour team challenge: deploy a working solution." },
    { name: "Mock Interviews & CV Reviews", when: "Week 9", what: "Practice questions and portfolio feedback before Demo Day." }
  ];

  const sessionFormat = [
    ["Concept introduction", "20 min", "The what and why behind today's lab"],
    ["Live demo", "30 min", "Instructor builds it live; ask questions"],
    ["Hands-on lab", "70–90 min", "Build along on your own machine or account"],
    ["Challenge", "20–30 min", "A twist on the lab or a broken setup to fix"],
    ["Briefing & Q&A", "10 min", "What to finish before next session"]
  ];

  return { modules, tags, setup, drills, drillCats, cards, interview, careers, resourceGroups, community, sessionFormat };
})();
