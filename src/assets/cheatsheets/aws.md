**Roadmap**

> - **Module 1:** Ch 00–07 — Cloud fundamentals, global infra, IAM, networking, VPC, EC2, Auto Scaling, ELB/Route53
> - **Module 2:** Ch 08–13 — S3, CloudFront, RDS, Aurora, DynamoDB, ElastiCache
> - **Module 3:** Ch 14–25 — Lambda, API Gateway, Containers (ECS/EKS), SQS/SNS/EventBridge, Kinesis/MSK, SES, Cognito
> - **Module 4:** Ch 26–39 — Secrets Manager, SSM, CloudWatch, CloudTrail, X-Ray, ECR, CI/CD, IaC (Terraform/CDK), Security
> - **Module 5:** Ch 40–44 — Production architectures, decision trees, cost, interview questions, cheat sheets

### Module 1 of 5 — Foundations & Core Infrastructure (Chapters 00–07)

---

## Chapter 00 — Cloud Computing Fundamentals

### What is Cloud?

Instead of buying, racking, and maintaining physical servers, you **rent compute, storage, and networking** from a provider (AWS, Azure, GCP) and pay only for what you use.

**On-Premise vs Cloud**

```
On-Premise                          Cloud
──────────                          ─────
Own Servers                         Rent Servers (EC2)
Own Electricity/Cooling             Provider handles it
Own Network Hardware                Virtual Networking (VPC)
Capacity planned for peak load      Scale up/down on demand
Capex (buy upfront)                 Opex (pay-as-you-go)
```

### Advantages

- **Pay as you go** — no upfront hardware cost
- **Elasticity** — scale in/out automatically with demand
- **High Availability** — spread across data centers (AZs) with no extra hardware
- **Global Reach** — deploy to a new region in minutes, not months

### Service Models (corrected orientation — IaaS is the foundation, not the top)

Think of this as a **stack**, where each layer up removes more operational responsibility from you:

```
┌───────────────────────────────┐
│   SaaS (Software as a Service)│  ← You just use the app (Gmail, Salesforce)
├───────────────────────────────┤
│   PaaS (Platform as a Service)│  ← You deploy code, provider manages runtime
│   (Elastic Beanstalk, Lambda) │
├───────────────────────────────┤
│   IaaS (Infrastructure as a   │  ← You manage OS, runtime, scaling
│   Service) — EC2, VPC, EBS    │
└───────────────────────────────┘
        ↑
  You own less as you go up the stack
  You control more as you go down the stack
```

| Model | You Manage                      | Provider Manages                           | AWS Example                    |
| ----- | ------------------------------- | ------------------------------------------ | ------------------------------ |
| IaaS  | OS, runtime, app, data, scaling | Physical hardware, virtualization, network | EC2, EBS, VPC                  |
| PaaS  | App code, data                  | OS, runtime, patching, scaling             | Elastic Beanstalk, Lambda, RDS |
| SaaS  | Just your usage/config          | Everything                                 | WorkMail, Chime                |

**Interview framing:** "IaaS gives you the most control and the most responsibility. As you move to PaaS and SaaS, you trade control for velocity."

### Deployment Models

- **Public Cloud** — shared infrastructure, multi-tenant (standard AWS account)
- **Private Cloud** — dedicated infrastructure (AWS Outposts, on-prem)
- **Hybrid Cloud** — mix of on-prem + cloud (common in regulated industries — banks, healthcare)
- **Multi-Cloud** — using more than one provider (AWS + GCP) to avoid lock-in or meet compliance

### Common Mistakes

- Assuming "cloud = automatically cheaper" — at scale, poorly optimized cloud can cost _more_ than on-prem
- Confusing PaaS with SaaS (Lambda is PaaS, not SaaS — you still write code)

### Interview Questions

- **Beginner:** What's the difference between IaaS, PaaS, and SaaS? Give one AWS example of each.
- **Intermediate:** Why would a company choose hybrid cloud over full migration?
- **Senior:** How would you architect a multi-cloud strategy to avoid vendor lock-in, and what are the tradeoffs?

---

## Chapter 01 — AWS Global Infrastructure

### What is a Region?

A **Region** is a physical geographic location (e.g., `ap-south-1` = Mumbai) containing multiple isolated data centers. Regions are fully independent — data doesn't leave a region unless you explicitly replicate it.

### Availability Zone (AZ)

An AZ is one or more discrete data centers with independent power, cooling, and networking, within a Region. AZs are connected via high-speed private links but are physically isolated so a disaster in one AZ doesn't take down another.

```
Region: ap-south-1 (Mumbai)
├── AZ: ap-south-1a  ── Data Center(s)
├── AZ: ap-south-1b  ── Data Center(s)
└── AZ: ap-south-1c  ── Data Center(s)
        │
        └── Connected via AWS backbone (low latency, high bandwidth)
```

### Edge Locations

Smaller sites (hundreds globally) used by **CloudFront** and **Route53** to cache content and resolve DNS closer to the end user, reducing latency.

### Local Zones

Extensions of a Region placed closer to large population/industry centers (e.g., for ultra-low-latency gaming, media, or real-time apps) — a small subset of AWS services runs here.

### Outposts

AWS hardware racks installed **physically in your own data center** — for hybrid workloads needing local compute/storage but AWS-native APIs.

### Wavelength

AWS compute/storage embedded within telecom providers' 5G networks — for ultra-low-latency mobile/edge applications.

### Why This Matters (Architecture Decisions)

| Requirement                         | Use                         |
| ----------------------------------- | --------------------------- |
| Disaster recovery across cities     | Multi-Region                |
| High availability within a city     | Multi-AZ                    |
| Cache static content globally       | CloudFront + Edge Locations |
| On-prem data residency + AWS APIs   | Outposts                    |
| Ultra-low latency for telco/5G apps | Wavelength                  |

### CLI Example

```bash
# List all regions
aws ec2 describe-regions --output table

# List AZs in a specific region
aws ec2 describe-availability-zones --region ap-south-1
```

### Common Mistakes

- Deploying only in a single AZ ("Multi-AZ" is not automatic — you must architect for it)
- Confusing Edge Locations (CDN caching) with Local Zones (actual compute)

### Interview Questions

- **Beginner:** What is the difference between a Region and an Availability Zone?
- **Intermediate:** Why do RDS Multi-AZ and read replicas exist as separate features if AZs already provide redundancy?
- **Senior:** Design a disaster recovery strategy for a system that must survive an entire region going down.

---

## Chapter 02 — IAM & Security

### What is IAM?

Identity and Access Management controls **who** (authentication) can do **what** (authorization) on **which** AWS resources.

### Core Concepts

- **Users** — individual identities (people or apps) with long-term credentials
- **Groups** — collections of users sharing the same permissions
- **Roles** — temporary identities assumed by users, services, or external accounts (no long-term credentials — this is the AWS-recommended pattern)
- **Policies** — JSON documents defining permissions (attached to users/groups/roles)
- **STS (Security Token Service)** — issues temporary credentials when a role is assumed
- **IAM Identity Center** (formerly AWS SSO) — centralized workforce identity across multiple AWS accounts

### Flow

```
User/Service
    │  (assumes)
    ▼
   Role
    │  (has attached)
    ▼
  Policy  (defines allowed actions)
    │
    ▼
 Resource (S3, EC2, DynamoDB...)
```

### Example Policy (least privilege — read-only S3 bucket access)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": ["arn:aws:s3:::my-app-bucket", "arn:aws:s3:::my-app-bucket/*"]
    }
  ]
}
```

### Cross-Account Access

Instead of sharing credentials between AWS accounts, Account A creates a **role** that trusts Account B. Account B's users/services assume that role via STS to get temporary credentials.

```bash
aws sts assume-role \
  --role-arn arn:aws:iam::111122223333:role/CrossAccountReadOnly \
  --role-session-name my-session
```

### AWS Organizations & Service Control Policies (SCPs) — Multi-Account Governance

This is the piece senior engineers are expected to know cold.

**AWS Organizations** lets you centrally manage multiple AWS accounts (e.g., separate accounts per team/environment: `prod`, `staging`, `security`, `sandbox`) under one management account, with consolidated billing.

**Service Control Policies (SCPs)** are org-level guardrails that set the **maximum available permissions** for accounts/OUs — they don't grant permissions, they restrict what IAM policies _inside_ those accounts can ever allow, even for the account's own admins.

```
Management Account (AWS Organizations)
    │
    ├── OU: Production
    │     └── SCP: Deny region access outside ap-south-1, us-east-1
    │
    ├── OU: Sandbox
    │     └── SCP: Deny expensive instance types, deny disabling CloudTrail
    │
    └── OU: Security
          └── SCP: Full access for audit tooling only
```

Example SCP — block all regions except two:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Deny",
      "Action": "*",
      "Resource": "*",
      "Condition": {
        "StringNotEquals": {
          "aws:RequestedRegion": ["ap-south-1", "us-east-1"]
        }
      }
    }
  ]
}
```

**Key distinction (a favorite interview trap):**
| | IAM Policy | SCP |
|---|---|---|
| Grants permissions? | Yes | No — only restricts |
| Applies to | Users/roles | Entire accounts/OUs |
| Can it grant access an IAM policy denies? | No | No |
| Can an account admin override it? | N/A | No — SCPs are enforced above account level |

### Common Mistakes

- Using long-lived IAM user access keys for applications instead of roles
- Attaching `AdministratorAccess` for convenience during development and forgetting to scope it down
- Not using SCPs to prevent root-account or region sprawl in multi-account setups

### Interview Questions

- **Beginner:** What's the difference between a Role and a User in IAM?
- **Intermediate:** How does STS work when assuming a cross-account role?
- **Senior:** How would you use AWS Organizations + SCPs to enforce that no engineer can ever disable CloudTrail logging, even as an account admin?

---

## Chapter 03 — Networking Fundamentals

### Core Building Blocks

- **IP Address** — unique identifier for a device on a network
- **Private IP** — only routable within a private network (e.g., `10.0.0.0/8`)
- **Public IP** — routable on the internet
- **CIDR (Classless Inter-Domain Routing)** — notation for IP ranges, e.g., `10.0.0.0/16` = 65,536 addresses
- **DNS** — resolves domain names to IP addresses
- **NAT (Network Address Translation)** — allows private-IP resources to reach the internet without exposing them directly
- **Subnet** — a subdivision of a network's IP range, tied to a single AZ
- **Firewall / Ports / TCP / UDP** — control and define how traffic flows

### CIDR Quick Reference

| CIDR | # of IPs | Common Use                                |
| ---- | -------- | ----------------------------------------- |
| /16  | 65,536   | Whole VPC                                 |
| /24  | 256      | A subnet                                  |
| /28  | 16       | Small reserved subnet (e.g., NAT Gateway) |

### Flow

```
Internet
   │
   ▼
 Router (Internet Gateway in AWS)
   │
   ▼
 Subnet (public or private, CIDR block, tied to one AZ)
   │
   ▼
  EC2 Instance (with private IP, optionally public IP)
```

### Common Mistakes

- Sizing subnets too small early on (e.g., a `/28` subnet for a growing app fleet) and running out of IPs
- Forgetting that a subnet is always tied to exactly one AZ (not spread across AZs)

### Interview Questions

- **Beginner:** What is CIDR notation and why does AWS use it for VPC/subnet sizing?
- **Intermediate:** Why can't a single subnet span multiple Availability Zones?

---

## Chapter 04 — Amazon VPC

### Why VPC Exists

A **VPC (Virtual Private Cloud)** is your own logically isolated network within AWS — you control the IP range, subnets, routing, and gateways, just like a private data center network, but virtual.

### Components

| Component                  | Purpose                                                                             |
| -------------------------- | ----------------------------------------------------------------------------------- |
| **Public Subnet**          | Has a route to an Internet Gateway — resources can have public IPs                  |
| **Private Subnet**         | No direct route to the internet — used for databases, internal services             |
| **Route Table**            | Defines where traffic from a subnet is directed                                     |
| **NACL**                   | Stateless firewall at the _subnet_ level (evaluates rules in order, allow/deny)     |
| **Security Group**         | Stateful firewall at the _instance/ENI_ level (return traffic auto-allowed)         |
| **Internet Gateway (IGW)** | Allows public subnet resources to reach/be reached from the internet                |
| **NAT Gateway**            | Allows private subnet resources to reach the internet (outbound only)               |
| **VPN**                    | Encrypted connection between your network and AWS                                   |
| **VPC Peering**            | Direct private connection between two VPCs (non-transitive)                         |
| **Transit Gateway**        | Hub-and-spoke connector for many VPCs/VPNs (transitive, scales better than peering) |

### Security Group vs NACL (classic interview question)

|            | Security Group                         | NACL                                                |
| ---------- | -------------------------------------- | --------------------------------------------------- |
| Level      | Instance/ENI                           | Subnet                                              |
| State      | Stateful (return traffic auto-allowed) | Stateless (must explicitly allow both directions)   |
| Rules      | Allow only                             | Allow AND Deny                                      |
| Evaluation | All rules evaluated                    | Rules evaluated in numbered order, first match wins |

### Standard Production VPC Layout

```
VPC (10.0.0.0/16)
│
├── Public Subnet (10.0.1.0/24) — AZ-a
│     └── ALB, NAT Gateway, Bastion Host
│
├── Private Subnet (10.0.2.0/24) — AZ-a
│     └── EC2 / ECS tasks (application layer)
│
└── Private DB Subnet (10.0.3.0/24) — AZ-a
      └── RDS / ElastiCache (no internet route at all)

(Repeat the same three-tier layout in AZ-b and AZ-c for HA)
```

### Terraform Example

```hcl
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_subnet" "public" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "ap-south-1a"
  map_public_ip_on_launch = true
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id
}

resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
}
```

### Common Mistakes

- Putting databases in a public subnet "temporarily" and forgetting to move them
- Using VPC Peering at scale instead of Transit Gateway (peering doesn't scale past a handful of VPCs — it's non-transitive, so you need a full mesh)
- Forgetting NAT Gateway costs (billed per hour + per GB processed) — a common surprise cost line item

### Interview Questions

- **Beginner:** What's the difference between a public and private subnet?
- **Intermediate:** Security Group vs NACL — when would you use both?
- **Senior:** You have 30 VPCs across teams that all need to talk to each other and to on-prem. Peering or Transit Gateway? Why?

---

## Chapter 05 — EC2

### What is EC2?

Elastic Compute Cloud — resizable virtual machines in the cloud.

### Core Concepts

- **AMI (Amazon Machine Image)** — a template (OS + software) used to launch instances
- **EBS (Elastic Block Store)** — persistent network-attached storage volume, survives instance stop/termination (if configured)
- **Instance Store** — physically attached, ephemeral storage — lost on stop/terminate, used for high-IOPS temp data (cache, scratch space)
- **Elastic IP** — a static public IP you can attach/detach/reassign
- **Key Pair** — SSH public/private key for secure instance access
- **User Data** — a bootstrap script that runs once on first boot
- **Security Groups** — instance-level stateful firewall
- **Placement Groups** — control instance placement: `Cluster` (low latency, same rack), `Spread` (max separation, critical single instances), `Partition` (large distributed systems like HDFS/Cassandra)
- **Nitro** — AWS's custom hypervisor/hardware system offloading virtualization overhead to dedicated hardware, giving near bare-metal performance

### Lifecycle

```
AMI → Launch → EC2 Instance → (Stop / Start / Reboot / Terminate)
                     │
                     ▼
                   EBS (attached, persists across stop/start)
```

### Boot Process

1. AMI is copied to root EBS volume (or instance store)
2. Instance is assigned to a physical host by Nitro
3. Networking (ENI, private/public IP) is attached
4. User Data script runs (if provided)
5. OS boots, instance reaches `running` state

### Spot Instances & Instance Purchasing Options (belongs here, not just in cost chapter)

| Purchase Option               | Discount        | Interruption Risk                   | Best For                                                               |
| ----------------------------- | --------------- | ----------------------------------- | ---------------------------------------------------------------------- |
| **On-Demand**                 | None (baseline) | None                                | Unpredictable, short-term workloads                                    |
| **Reserved Instances (RI)**   | Up to ~72%      | None                                | Steady-state, predictable baseline (1-3 yr commit)                     |
| **Savings Plans**             | Up to ~72%      | None                                | Flexible commit to $/hr compute usage across instance families         |
| **Spot Instances**            | Up to ~90%      | Can be reclaimed with 2-min warning | Fault-tolerant, stateless, batch/CI, big data, ML training             |
| **Dedicated Hosts/Instances** | Premium         | None                                | Compliance requiring physical isolation, license-based software (BYOL) |

**How Spot works:** You bid into a shared pool of unused EC2 capacity. AWS can reclaim the instance with a 2-minute interruption notice if it needs the capacity back or the Spot price exceeds your max. Design for this using:

- **Spot Fleet / EC2 Auto Scaling with mixed instances policy** — diversify across instance types/AZs to reduce simultaneous interruption risk
- **Interruption handlers** — catch the termination notice via the instance metadata endpoint and gracefully drain connections

```bash
# Check for spot interruption notice from inside the instance
curl -s http://169.254.169.254/latest/meta-data/spot/instance-action
```

Terraform — mixed instances Auto Scaling Group leaning on Spot:

```hcl
resource "aws_autoscaling_group" "app" {
  desired_capacity = 4
  max_size          = 10
  min_size          = 2
  vpc_zone_identifier = [aws_subnet.private_a.id, aws_subnet.private_b.id]

  mixed_instances_policy {
    instances_distribution {
      on_demand_base_capacity                  = 1
      on_demand_percentage_above_base_capacity = 20
      spot_allocation_strategy                 = "capacity-optimized"
    }
    launch_template {
      launch_template_specification {
        launch_template_id = aws_launch_template.app.id
      }
      override {
        instance_type = "m5.large"
      }
      override {
        instance_type = "m5a.large"
      }
    }
  }
}
```

### CLI Example

```bash
# Launch an instance
aws ec2 run-instances \
  --image-id ami-0abcdef1234567890 \
  --instance-type t3.micro \
  --key-name my-key \
  --security-group-ids sg-0123456789abcdef0 \
  --subnet-id subnet-0123456789abcdef0

# Stop / Start / Terminate
aws ec2 stop-instances --instance-ids i-0123456789abcdef0
aws ec2 start-instances --instance-ids i-0123456789abcdef0
aws ec2 terminate-instances --instance-ids i-0123456789abcdef0
```

### SDK Example (Node.js)

```javascript
import { EC2Client, RunInstancesCommand } from "@aws-sdk/client-ec2";

const client = new EC2Client({ region: "ap-south-1" });

const command = new RunInstancesCommand({
  ImageId: "ami-0abcdef1234567890",
  InstanceType: "t3.micro",
  MinCount: 1,
  MaxCount: 1,
  KeyName: "my-key",
});

const response = await client.send(command);
console.log(response.Instances[0].InstanceId);
```

### Common Mistakes

- Running stateful workloads (databases, session state) on Spot Instances without a failover plan
- Forgetting Instance Store data is lost on **stop**, not just terminate
- Not using placement groups for latency-sensitive clustered workloads (e.g., HPC, in-memory databases)

### Interview Questions

- **Beginner:** Difference between EBS and Instance Store?
- **Intermediate:** When would you choose Spot Instances over On-Demand, and how do you handle interruptions gracefully?
- **Senior:** Design a batch processing pipeline that costs 70% less than On-Demand while tolerating instance loss mid-job.

---

## Chapter 06 — Auto Scaling

### Why It Exists

Manually adding/removing servers as traffic changes doesn't scale (pun intended). Auto Scaling Groups (ASGs) automatically launch/terminate EC2 instances based on demand.

### Flow

```
Traffic
   │
   ▼
Load Balancer
   │
   ▼
EC2 Fleet (Auto Scaling Group)
   │
   ▼
CloudWatch Metric (e.g., CPU > 70%)
   │
   ▼
Scaling Policy triggers → Launch/Terminate EC2
```

### Scaling Policies

- **Target Tracking** — "keep average CPU at 50%" — AWS handles the math (most common, recommended default)
- **Step Scaling** — scale by specific increments based on how far a metric breaches a threshold
- **Predictive Scaling** — uses ML on historical patterns to pre-scale before an anticipated spike (e.g., daily 9am traffic surge)
- **Scheduled Scaling** — scale at fixed times (e.g., scale up before a known sale event)

### Terraform Example

```hcl
resource "aws_autoscaling_policy" "cpu_target_tracking" {
  name                   = "cpu-target-tracking"
  autoscaling_group_name = aws_autoscaling_group.app.name
  policy_type            = "TargetTrackingScaling"

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
    target_value = 50.0
  }
}
```

### Common Mistakes

- Setting scale-in cooldowns too short, causing "flapping" (constant scale in/out)
- Scaling only on CPU when the real bottleneck is memory, connections, or queue depth
- Not testing scale-up speed against actual traffic ramp — if instances take 90s to become healthy but traffic spikes in 30s, users see errors regardless of ASG config

### Interview Questions

- **Beginner:** What triggers an Auto Scaling Group to add an instance?
- **Intermediate:** Target Tracking vs Step Scaling — when would you pick one over the other?
- **Senior:** Your traffic spikes predictably every day at 9am but ASG reacts too slowly. How do you fix this?

---

## Chapter 07 — Elastic Load Balancer & Route53

### ELB Types

| Type                                | Layer           | Use Case                                                         | Status                                                                              |
| ----------------------------------- | --------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| **ALB (Application Load Balancer)** | L7 (HTTP/HTTPS) | Web apps, path/host-based routing, microservices                 | Recommended default                                                                 |
| **NLB (Network Load Balancer)**     | L4 (TCP/UDP)    | Ultra-high throughput, static IP, low latency                    | Recommended for TCP workloads                                                       |
| **GWLB (Gateway Load Balancer)**    | L3              | Transparently insert third-party appliances (firewalls, IDS/IPS) | Specialized use                                                                     |
| **CLB (Classic Load Balancer)**     | L4/L7 (legacy)  | —                                                                | ⚠️ **Deprecated/Legacy — do not use in new architectures.** Use ALB or NLB instead. |

### Decision Tree

```
Need HTTP/HTTPS routing (path/host based, WebSocket)?
   └── Yes → ALB

Need raw TCP/UDP, extreme throughput, static IP?
   └── Yes → NLB

Need to insert a third-party network appliance transparently?
   └── Yes → GWLB

Considering CLB?
   └── Don't. Use ALB or NLB. CLB is legacy and lacks modern features
       (no host-based routing, no native container/Lambda targets).
```

### Route53

AWS's DNS service, also supporting:

- **Routing Policies:** Simple, Weighted, Latency-based, Failover, Geolocation, Geoproximity, Multivalue
- **Health Checks** — automatically remove unhealthy endpoints from rotation
- **Alias Records** — point a domain directly at an AWS resource (ALB, CloudFront, S3) without an extra DNS lookup hop

### Common Mistakes

- Still using CLB "because it's cheaper" — it lacks WAF integration, native container targets, and modern TLS features
- Not setting Route53 health checks, so DNS keeps resolving to a dead endpoint during an outage
- Using an ALB when the workload is pure TCP with extreme throughput needs — NLB will perform better and cheaper here

### Interview Questions

- **Beginner:** What's the difference between ALB and NLB?
- **Intermediate:** Why is CLB considered legacy, and what should you migrate to?
- **Senior:** Design a multi-region active-active architecture using Route53 failover/latency routing with ALBs in each region.

---

### Module 2 of 5 — Storage & The Data Layer (Chapters 08–13)

> This module covers S3, CloudFront, RDS, Aurora (new addition), DynamoDB, and ElastiCache — with the modern updates you flagged (OAC over OAI, Aurora Serverless v2/Global Databases, ElastiCache Serverless + Valkey vs Memcached).

---

## Chapter 08 — S3

### What is S3?

Simple Storage Service — object storage for effectively unlimited data, accessed via HTTP(S) API rather than a filesystem.

### Core Concepts

- **Bucket** — a globally-unique-named container for objects
- **Object** — the actual data (file) + metadata + a key (its "path")
- **Storage Classes** — cost/access-frequency tiers (see below)
- **Lifecycle Policies** — automatically transition or expire objects over time
- **Versioning** — keeps multiple versions of an object; protects against accidental overwrite/delete
- **Replication** — Cross-Region (CRR) or Same-Region (SRR) automatic copying
- **Encryption** — SSE-S3 (AWS-managed keys), SSE-KMS (customer-managed keys, auditable via CloudTrail), SSE-C (customer-supplied keys)
- **Pre-Signed URLs** — time-limited URLs granting temporary access to a private object without making it public
- **Multipart Upload** — splits large uploads (>100MB recommended, required above 5GB) into parallel parts for speed and resilience
- **Event Notifications** — trigger Lambda/SQS/SNS on object create/delete
- **Static Website Hosting** — serve a bucket's contents directly as a website
- **Transfer Acceleration** — routes uploads through CloudFront edge locations for faster long-distance transfer
- **Object Lock** — WORM (write-once-read-many) compliance mode, prevents deletion even by root

### Storage Classes

| Class                      | Access Pattern               | Retrieval     | Cost                         |
| -------------------------- | ---------------------------- | ------------- | ---------------------------- |
| Standard                   | Frequent                     | Instant       | Highest of the "hot" tiers   |
| Intelligent-Tiering        | Unknown/changing             | Instant       | Auto-optimizes for you       |
| Standard-IA                | Infrequent                   | Instant       | Lower storage, retrieval fee |
| One Zone-IA                | Infrequent, recreatable data | Instant       | Cheaper (single AZ risk)     |
| Glacier Instant Retrieval  | Archive, rarely accessed     | Instant       | Very low                     |
| Glacier Flexible Retrieval | Archive                      | Minutes–hours | Very low                     |
| Glacier Deep Archive       | Long-term archive            | Hours         | Lowest                       |

### Diagram

```
Bucket (my-app-bucket)
   │
   ├── /uploads/2026/07/photo.jpg   (Standard)
   ├── /logs/2025/*.gz              (Glacier Deep Archive, via lifecycle rule)
   └── /backups/db-snapshot.sql     (Standard-IA)
```

### Pre-Signed URL Example (Node.js)

```javascript
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const client = new S3Client({ region: "ap-south-1" });

const command = new GetObjectCommand({
  Bucket: "my-app-bucket",
  Key: "uploads/photo.jpg",
});

const url = await getSignedUrl(client, command, { expiresIn: 300 }); // 5 min
```

### CLI Example

```bash
# Enable versioning
aws s3api put-bucket-versioning \
  --bucket my-app-bucket \
  --versioning-configuration Status=Enabled

# Add a lifecycle rule to move objects to Glacier after 90 days
aws s3api put-bucket-lifecycle-configuration \
  --bucket my-app-bucket \
  --lifecycle-configuration file://lifecycle.json
```

### Common Mistakes

- Making buckets public "just to test" and forgetting to lock them down
- Not enabling versioning before a destructive migration
- Ignoring multipart upload for large files — leads to failed uploads on flaky connections

### Interview Questions

- **Beginner:** What's the difference between S3 Standard and Glacier?
- **Intermediate:** How do pre-signed URLs work, and why are they safer than making an object public?
- **Senior:** Design an image upload pipeline handling 500MB videos reliably over unstable mobile networks.

---

## Chapter 09 — CloudFront

### What is a CDN?

CloudFront caches content at edge locations near users, reducing latency and origin load.

```
User
  │
  ▼
Nearest Edge Location (cached? → serve directly)
  │  (cache miss)
  ▼
Origin (S3, ALB, custom HTTP server)
```

### Core Concepts

- **Cache / TTL** — how long content is stored at the edge before revalidating with origin
- **Origins** — where CloudFront fetches uncached content from (S3, ALB, EC2, any HTTP(S) endpoint)
- **Behaviors** — path-based rules (e.g., `/api/*` → no caching, forward to ALB; `/static/*` → cache 1 year)
- **Signed URLs / Signed Cookies** — restrict access to private content, similar to S3 pre-signed URLs but at the CDN layer
- **Invalidation** — force-expire cached objects before their TTL (costs money past a free monthly quota — prefer versioned filenames like `app.a1b2c3.js` over invalidation where possible)

### Securing S3 Origins: OAC over OAI (important modern update)

When CloudFront serves content from a **private** S3 bucket, it needs permission to read from it without making the bucket public.

- **OAI (Origin Access Identity)** — the older mechanism. Limited: doesn't support SSE-KMS-encrypted objects well, doesn't support all S3 API actions, being phased out.
- **OAC (Origin Access Control)** — the current, AWS-recommended mechanism. Supports SSE-KMS, all S3 regions, and all HTTP methods. **New CloudFront distributions should always use OAC, never OAI.**

```
CloudFront Distribution
   │  (uses OAC — signs every request with SigV4)
   ▼
S3 Bucket Policy (allows only this specific distribution's OAC principal)
   │
   ▼
Private Objects (bucket itself has all public access blocked)
```

Example bucket policy for OAC:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "cloudfront.amazonaws.com" },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::my-app-bucket/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::111122223333:distribution/EDFDVBD6EXAMPLE"
        }
      }
    }
  ]
}
```

### Terraform (CloudFront + OAC + S3)

```hcl
resource "aws_cloudfront_origin_access_control" "oac" {
  name                              = "s3-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "cdn" {
  origin {
    domain_name              = aws_s3_bucket.assets.bucket_regional_domain_name
    origin_id                = "s3-origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.oac.id
  }

  default_cache_behavior {
    target_origin_id       = "s3-origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods          = ["GET", "HEAD"]
  }

  enabled             = true
  default_root_object = "index.html"

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
```

### Common Mistakes

- Still configuring new distributions with OAI (legacy) instead of OAC
- Caching API responses that should never be cached (missing `Cache-Control: no-store` behaviors on dynamic paths)
- Relying on invalidations for every deploy instead of content-hashed filenames

### Interview Questions

- **Beginner:** What's the role of TTL in CDN caching?
- **Intermediate:** Why is OAC preferred over OAI for securing an S3 origin?
- **Senior:** Design a CloudFront setup serving both a static SPA (`/`) and a dynamic API (`/api/*`) from the same domain, with correct caching behavior for each.

---

## Chapter 10 — RDS

### Core Concepts

- **Database Engines** — MySQL, PostgreSQL, MariaDB, Oracle, SQL Server (and Aurora — see below)
- **Read Replica** — asynchronous copy for scaling **read** traffic, can be promoted to standalone
- **Multi-AZ** — synchronous standby in a different AZ for **failover/HA**, not for read scaling
- **Backups / Snapshots** — automated (point-in-time restore) vs manual snapshots (kept until deleted)
- **Parameter Groups** — engine configuration (e.g., max connections, query cache)
- **Performance Insights** — visual query/wait-time analysis for finding slow queries

### Read Replica vs Multi-AZ (classic interview trap)

|                         | Read Replica | Multi-AZ                                      |
| ----------------------- | ------------ | --------------------------------------------- |
| Purpose                 | Scale reads  | High availability / failover                  |
| Replication             | Asynchronous | Synchronous                                   |
| Can serve read traffic? | Yes          | No (standby is not queryable in standard RDS) |
| Automatic failover?     | No           | Yes                                           |

### Diagram

```
Application
   │
   ▼
Connection Pool (e.g., RDS Proxy / PgBouncer)
   │
   ▼
RDS Primary (Multi-AZ standby, synchronous)
   │
   ├──► Read Replica 1 (async, serves reporting queries)
   └──► Read Replica 2 (async, serves read-heavy API traffic)
```

### CLI Example

```bash
aws rds create-db-instance \
  --db-instance-identifier my-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --master-username admin \
  --master-user-password ****** \
  --allocated-storage 100 \
  --multi-az
```

### Common Mistakes

- Assuming Multi-AZ standby can absorb read traffic (it can't, in classic RDS)
- Not using RDS Proxy/connection pooling with Lambda — each concurrent Lambda invocation opens its own DB connection, exhausting the connection limit fast
- Sizing storage/IOPS for average load instead of peak, causing throttling during traffic spikes

---

## Chapter 10b — Amazon Aurora (the modern default over vanilla RDS)

### Why Aurora Instead of Plain RDS

Aurora is AWS's own MySQL/PostgreSQL-compatible engine, re-architected for cloud-native performance: storage is decoupled from compute and automatically replicated 6-ways across 3 AZs, giving faster failover, higher throughput, and continuous backup to S3 without you managing it.

### Aurora Serverless v2

Instead of provisioning a fixed instance size, Aurora Serverless v2 scales compute capacity (measured in **ACUs — Aurora Capacity Units**) up and down in fine-grained increments in seconds, based on load — you pay for what you use, without the cold-start behavior of Serverless v1.

```
Traffic ↑ → ACUs scale up (seconds, no downtime)
Traffic ↓ → ACUs scale down → lower bill
```

Best for: variable/unpredictable workloads (dev/test environments, SaaS with bursty tenants, new products with unknown traffic patterns) where a fixed-size instance would either be overprovisioned (waste) or underprovisioned (outages).

### Aurora Global Database

Replicates data across **Regions** with typically <1 second replication lag, using dedicated infrastructure separate from your compute — for:

- Multi-region disaster recovery (promote a secondary region to primary in \<1 minute during an outage)
- Low-latency local reads for globally distributed users

```
Primary Region (ap-south-1)
   │  (Aurora storage-layer replication, <1s lag)
   ▼
Secondary Region (us-east-1) — read-only, can be promoted on DR event
```

### Aurora Cloning

Creates a new Aurora cluster from an existing one **instantly**, using copy-on-write — no full data copy is done upfront, only changed pages are actually duplicated. This makes it extremely fast (minutes, regardless of database size) and cheap to spin up:

- Full-size staging environments from production data
- Testing a risky migration against a real copy without touching production

```bash
aws rds restore-db-cluster-to-point-in-time \
  --source-db-cluster-identifier prod-cluster \
  --db-cluster-identifier staging-clone \
  --restore-type copy-on-write \
  --use-latest-restorable-time
```

### Interview Questions

- **Beginner:** What's the core architectural difference between Aurora and standard RDS?
- **Intermediate:** When would you choose Aurora Serverless v2 over a fixed-size Aurora instance?
- **Senior:** Design a globally distributed SaaS read path using Aurora Global Database, and explain your RPO/RTO during a regional failover.

---

## Chapter 11 — DynamoDB

### Core Concepts

- **Partition Key** — determines which physical partition an item lives on (hash-based distribution)
- **Sort Key** — orders items within the same partition key (enables range queries)
- **GSI (Global Secondary Index)** — query by a different key than the base table's, with its own partition/sort key
- **LSI (Local Secondary Index)** — alternate sort key, same partition key as the base table, must be created at table creation time
- **Streams** — a time-ordered log of item-level changes, consumable by Lambda for event-driven workflows
- **TTL** — automatically deletes expired items (e.g., session data) at no extra write cost
- **Capacity Modes** — On-Demand (pay-per-request, unpredictable traffic) vs Provisioned (cheaper at steady, predictable high volume)
- **Transactions** — atomic multi-item read/write operations (ACID across up to 100 items)
- **Global Tables** — multi-region, active-active replicated tables

### Diagram

```
Table: Orders
Partition Key: customerId       Sort Key: orderId
────────────────────────────────────────────────
customerId=123 │ orderId=001 │ {...}
customerId=123 │ orderId=002 │ {...}
customerId=456 │ orderId=001 │ {...}
```

### SDK Example (Node.js)

```javascript
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: "ap-south-1" }),
);

const result = await client.send(
  new QueryCommand({
    TableName: "Orders",
    KeyConditionExpression: "customerId = :cid",
    ExpressionAttributeValues: { ":cid": "123" },
  }),
);
```

### Common Mistakes

- Choosing a low-cardinality partition key (e.g., `status`) causing a "hot partition" — one partition absorbs most traffic while others sit idle
- Modeling DynamoDB like a relational table (joins don't exist — design access patterns first, schema second)
- Forgetting GSIs have their own provisioned throughput and can throttle independently of the base table

### Interview Questions

- **Beginner:** What's the difference between a Partition Key and a Sort Key?
- **Intermediate:** GSI vs LSI — what's the key structural difference?
- **Senior:** Design a DynamoDB schema for a multi-tenant SaaS app avoiding hot partitions, supporting both "get all items for a tenant" and "get an item by ID" access patterns.

---

## Chapter 12 — ElastiCache

### Redis (now Valkey/Redis OSS forks) vs Memcached — the structural choice

Following Redis Inc.'s 2024 license change (moving Redis away from a fully open-source license), the ecosystem forked: **Valkey** (Linux Foundation-backed, AWS-supported) and **Redis OSS** continue as open-source-licensed options. AWS ElastiCache now supports **Valkey** as its default recommended engine going forward, alongside continued support for Redis OSS-compatible versions.

|                 | Valkey / Redis OSS                                        | Memcached                                               |
| --------------- | --------------------------------------------------------- | ------------------------------------------------------- |
| Data structures | Rich (strings, lists, sets, sorted sets, hashes, streams) | Simple key-value strings only                           |
| Persistence     | Yes (snapshotting/AOF)                                    | No (pure in-memory, lost on restart)                    |
| Replication/HA  | Yes (built-in)                                            | No (must shard client-side)                             |
| Pub/Sub         | Yes                                                       | No                                                      |
| Multi-threading | Mostly single-threaded per shard (scale via clustering)   | Native multi-threaded                                   |
| Best for        | Caching + session store + leaderboards + pub/sub + queues | Pure, simple, maximally simple caching at massive scale |

**Decision rule:** if you need anything beyond "store a value, get a value, expire a value" — pick Valkey/Redis. If you genuinely only need a dead-simple distributed cache and want to exploit native multi-threading per node, Memcached remains valid.

### ElastiCache Serverless (the shift you flagged)

Instead of provisioning fixed node types/shard counts upfront, **ElastiCache Serverless** scales compute and memory automatically based on traffic, per second, with no cluster management — you create a **cache**, not a cluster, and set a max-size ceiling for cost control.

```
Traffic pattern unknown or spiky
        │
        ▼
ElastiCache Serverless (Valkey or Memcached engine)
        │
        ▼
  Scales automatically — no node sizing, no shard planning
```

Best for: new services where you don't yet know the cache working-set size, dev/test, or highly variable multi-tenant caching load. For very large, stable, well-understood workloads, a provisioned cluster with reserved node pricing is still usually cheaper.

### Terraform — ElastiCache Serverless (Valkey)

```hcl
resource "aws_elasticache_serverless_cache" "cache" {
  engine = "valkey"
  name   = "app-cache"

  cache_usage_limits {
    data_storage {
      maximum = 10
      unit    = "GB"
    }
    ecpu_per_second {
      maximum = 5000
    }
  }
}
```

### Common Mistakes

- Using ElastiCache as a system of record (it's a cache — data loss on failover/restart is expected unless persistence is explicitly configured)
- Picking Memcached for session storage, then needing atomic increments/pub-sub later and having to migrate
- Not setting a max-size ceiling on Serverless, leading to a runaway bill under a traffic spike or cache-key explosion bug

### Interview Questions

- **Beginner:** What's the core difference between Redis/Valkey and Memcached?
- **Intermediate:** Why did AWS start recommending Valkey over Redis OSS, and does this change your application code?
- **Senior:** You don't yet know your cache working-set size for a new product launch. Would you choose ElastiCache Serverless or a provisioned cluster, and why?

---

### Module 3 of 5 — Serverless, Microservices & Messaging (Chapters 14–25)

> This module covers Lambda (with Function URLs & Destinations), API Gateway, Containers (ECS/EKS + Cloud Map + Service Mesh), Elastic Beanstalk, AWS Batch, the messaging trio (SQS/SNS/EventBridge), Step Functions, the new streaming pillar (Kinesis/MSK), SES, and Cognito.

---

## Chapter 14 — Lambda

### What is Lambda?

A fully managed compute service that runs your code in response to events, without you provisioning or managing servers. You pay per invocation + execution time.

### Lifecycle

```
Request
   │
   ▼
Lambda Service
   │
   ▼
Execution Environment (created fresh = "Cold Start", or reused = "Warm Start")
   │
   ▼
Your Handler Code Runs
   │
   ▼
Response
```

### Core Concepts

- **Cold Start** — first invocation (or scale-up) requires creating a new execution environment (download code, init runtime, run global/init code) — adds latency
- **Warm Start** — a subsequent invocation reuses an already-initialized environment — fast
- **Layers** — shared code/dependencies packaged separately from your function, reusable across functions
- **Runtime** — the language environment (Node.js, Python, Java, custom via Lambda Runtime API)
- **Memory** — also proportionally scales CPU/network — tuning memory is often the main performance lever
- **Timeout** — max execution time (up to 15 minutes)
- **Concurrency** — number of simultaneous executions; **Reserved Concurrency** caps/guarantees capacity for a function; **Provisioned Concurrency** keeps environments pre-warmed to eliminate cold starts for latency-sensitive functions
- **Event Sources** — what invokes the function: API Gateway, S3, DynamoDB Streams, SQS, EventBridge, ALB, etc.

### Function URLs (skip API Gateway for simple cases)

A **Function URL** gives a Lambda function its own dedicated HTTPS endpoint directly — no API Gateway resource needed. Ideal for:

- Simple webhooks (Stripe, GitHub webhook receivers)
- Single-purpose endpoints that don't need API Gateway's routing, request validation, usage plans, or custom authorizers
- Internal tools where you control both sides of the integration

```
Client → Function URL (https://<url-id>.lambda-url.<region>.on.aws/) → Lambda
```

**Function URL vs API Gateway — when to use which:**
| Need | Use |
|---|---|
| Just invoke one function over HTTPS, minimal setup | Function URL |
| Path/method routing across many functions | API Gateway |
| Request validation, API keys, usage plans, throttling per client | API Gateway |
| Custom authorizers, WAF integration | API Gateway |
| Native REST API surface for a public product | API Gateway |

Terraform — Function URL:

```hcl
resource "aws_lambda_function_url" "webhook" {
  function_name      = aws_lambda_function.webhook_handler.function_name
  authorization_type = "NONE"   # or "AWS_IAM" for signed requests
}
```

### Lambda Destinations

Instead of writing custom retry/error-handling code inside your function, **Destinations** let Lambda route the **result** of an asynchronous invocation (success or failure) to another service automatically — without needing a DLQ pattern bolted on manually.

```
Async Invocation
   │
   ▼
Lambda Executes
   │
   ├── On Success ──► Destination (SQS / SNS / EventBridge / another Lambda)
   └── On Failure ──► Destination (SQS / SNS / EventBridge / another Lambda)
```

This is strictly more capable than the older "Dead Letter Queue" config: DLQs only capture failures and only support SQS/SNS, while Destinations support success **and** failure, and support all four target types, and include invocation metadata (request/response payload) automatically.

```bash
aws lambda put-function-event-invoke-config \
  --function-name process-order \
  --destination-config '{
    "OnSuccess": {"Destination": "arn:aws:sns:ap-south-1:111122223333:order-processed"},
    "OnFailure": {"Destination": "arn:aws:sqs:ap-south-1:111122223333:order-dlq"}
  }'
```

### SDK Example (Node.js handler)

```javascript
export const handler = async (event) => {
  const body = JSON.parse(event.body ?? "{}");
  // business logic
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "processed", id: body.id }),
  };
};
```

### Common Mistakes

- Initializing SDK clients/DB connections _inside_ the handler instead of outside it (loses the benefit of warm starts reusing connections)
- Using Function URLs for a public-facing multi-route API instead of API Gateway, then bolting on routing logic manually inside the function
- Not setting Reserved Concurrency on a function that calls a downstream system with a hard connection limit (e.g., RDS) — an event storm can exhaust the DB's connections

### Interview Questions

- **Beginner:** What causes a Lambda cold start?
- **Intermediate:** When would you use a Function URL instead of API Gateway?
- **Senior:** Design a webhook ingestion + async processing pipeline using Lambda Destinations instead of manual retry logic, and explain your failure-handling path.

---

## Chapter 15 — API Gateway

### Types

- **REST API** — full feature set (request validation, API keys, usage plans, caching, custom authorizers)
- **HTTP API** — lighter weight, cheaper, lower latency, fewer features — the right default for most new Lambda-backed APIs
- **WebSocket API** — persistent, bidirectional connections (chat, live dashboards, notifications)

### Core Concepts

- **Authorizers** — Lambda Authorizer (custom logic) or JWT Authorizer (native OIDC/Cognito token validation) gate requests before they reach your backend
- **Rate Limits / Usage Plans** — throttle per API key/client
- **Stages** — named deployment environments (`dev`, `staging`, `prod`) with independent configuration
- **Deployments** — a deployed snapshot of your API configuration, tied to a stage
- **Caching** — cache responses at the stage level to reduce backend load

### Common Mistakes

- Using REST API when HTTP API would be cheaper and sufficient (no need for usage plans, request validation, etc.)
- Forgetting to enable throttling, exposing the backend to an unbounded traffic spike
- Putting business logic in a Lambda Authorizer instead of just token validation, adding latency to every single request

### Interview Questions

- **Beginner:** REST API vs HTTP API in API Gateway — what's the practical difference?
- **Intermediate:** How does a JWT Authorizer differ from a Lambda Authorizer?

---

## Chapter 16/17 — Containers: ECS & EKS

### Core Concepts

- **Docker** — packages an app + dependencies into a portable image
- **ECS (Elastic Container Service)** — AWS-native container orchestrator, simpler operational model
- **EKS (Elastic Kubernetes Service)** — managed Kubernetes control plane, for teams standardizing on K8s
- **Fargate** — serverless compute for containers (works with both ECS and EKS) — no EC2 instances to manage
- **Task Definition** — ECS's blueprint for a container (image, CPU/memory, ports, env vars) — analogous to a K8s Pod spec
- **Service** — keeps a desired number of tasks/pods running, integrates with load balancers
- **Cluster** — logical grouping of tasks/pods and the compute (EC2 or Fargate) running them

### Decision Tree

```
Need Kubernetes-native APIs / multi-cloud portability / existing K8s expertise on the team?
   └── Yes → EKS

Want the simplest AWS-native operational model, no K8s overhead?
   └── Yes → ECS

Either way — don't want to manage EC2 instances at all?
   └── Add Fargate on top of ECS or EKS
```

### Service Discovery: AWS Cloud Map

In a microservices architecture, services need to find each other's current network location (which changes constantly as tasks scale/restart). **AWS Cloud Map** provides service discovery: services register themselves under a friendly DNS name or HTTP API, and Cloud Map keeps the mapping updated as tasks come and go.

```
Order Service (ECS Task) ──registers──► Cloud Map
                                            │
Payment Service ──looks up "order.internal"─┘──► current healthy IP(s)
```

ECS integrates with Cloud Map natively — enabling **Service Connect** or classic **Service Discovery**, so `payment-service` can call `http://order-service.internal:8080` without hardcoding IPs or going through a load balancer for internal east-west traffic.

```hcl
resource "aws_service_discovery_service" "order_service" {
  name = "order-service"
  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.internal.id
    dns_records {
      type = "A"
      ttl  = 10
    }
  }
}
```

### Service Meshes: AWS App Mesh & Istio

As microservices grow, you need more than "find the service" — you need consistent **traffic management, observability, retries, circuit breaking, and mTLS between services**, without every team reimplementing it in application code. A **service mesh** solves this by injecting a lightweight proxy (sidecar) next to every service instance to handle all of this transparently.

- **AWS App Mesh** — AWS-native service mesh, integrates with ECS, EKS, and EC2. Uses Envoy proxy sidecars.
- **Istio** — the dominant open-source service mesh for Kubernetes (also Envoy-based), commonly used on EKS for teams wanting portability across clouds or richer community tooling.

```
Order Service ──► [Envoy Sidecar] ──mTLS, retries, circuit breaking──► [Envoy Sidecar] ──► Payment Service
                        │                                                     │
                        └──────────── metrics/traces to observability ────────┘
```

**When do you actually need a service mesh?** Only once you have enough services that consistent retry/circuit-breaking/mTLS policy and cross-service observability become a real operational problem — for a handful of services, this is usually premature complexity. This is a common senior-level judgment call: knowing _when not to_ add a mesh is as important as knowing how it works.

|            | Cloud Map                          | Service Mesh (App Mesh/Istio)                                                       |
| ---------- | ---------------------------------- | ----------------------------------------------------------------------------------- |
| Solves     | "Where is this service right now?" | "How should traffic between services behave?"                                       |
| Complexity | Low                                | Higher (sidecars, control plane)                                                    |
| Needed for | Any multi-service ECS/EKS setup    | Larger microservice fleets needing traffic policy, mTLS, fine-grained observability |

### Common Mistakes

- Adopting a service mesh before there's an actual operational pain point it solves — pure complexity tax otherwise
- Hardcoding internal service IPs instead of using Cloud Map, breaking every time tasks reschedule
- Choosing EKS purely because it's "more standard" when the team has no Kubernetes experience and ECS would ship faster

### Interview Questions

- **Beginner:** ECS vs EKS — what's the core tradeoff?
- **Intermediate:** What problem does AWS Cloud Map solve that a load balancer doesn't?
- **Senior:** At what point would you introduce a service mesh into a growing microservices architecture, and what would you evaluate before doing so?

---

## Chapter 18 — Elastic Beanstalk

PaaS layer on top of EC2/ELB/ASG — you upload code, Beanstalk provisions and manages the underlying infrastructure (EC2, load balancer, auto scaling, health monitoring) for you, while still letting you access the underlying resources if needed.

Best for: teams wanting fast deployment without deep infra config, without going fully serverless (Lambda) or fully containerized (ECS/EKS).

---

## Chapter 19 — AWS Batch

Fully managed batch computing — you submit jobs, AWS Batch provisions the optimal compute (EC2, including Spot) to run them, handling queuing, scheduling, and scaling to zero when idle.

Best for: large-scale parallel/scientific computing, ETL, ML training jobs, rendering — anything job-based rather than request/response based.

```
Job Submitted → Job Queue → Compute Environment (EC2/Spot, scales 0→N) → Runs → Scales back to 0
```

---

## Chapter 20 — SQS

### Core Concepts

- **Standard Queue** — at-least-once delivery, best-effort ordering, near-unlimited throughput
- **FIFO Queue** — exactly-once processing, strict ordering, throughput capped (though higher with batching)
- **Visibility Timeout** — how long a message is hidden from other consumers after being received, before it's assumed failed and becomes visible again
- **DLQ (Dead Letter Queue)** — captures messages that fail processing repeatedly (after `maxReceiveCount`) for inspection/reprocessing
- **Long Polling** — consumer waits for messages instead of returning empty immediately, reducing empty-response API calls
- **Batch** — send/receive/delete up to 10 messages per API call for efficiency

```
Producer ──► Queue ──► Consumer(s)
                │
                └── on repeated failure ──► DLQ
```

### Interview Questions

- **Intermediate:** Standard vs FIFO — what do you give up for strict ordering?
- **Senior:** A consumer is processing messages slower than they arrive. Walk through your options (visibility timeout tuning, batch size, consumer scaling, DLQ strategy).

---

## Chapter 21 — SNS

Pub/Sub messaging — one topic, many subscribers (email, SMS, Lambda, SQS, HTTP endpoints), each subscriber gets its own copy of every message.

```
SNS Topic
   ├──► Email Subscriber
   ├──► Lambda Subscriber
   └──► SQS Subscriber (fan-out pattern)
```

**Fan-out pattern:** SNS → multiple SQS queues is the standard way to let several independent consumers process the same event without competing for the same message.

---

## Chapter 22 — EventBridge

### Core Concepts

- **Bus** — the channel events flow through (default bus, custom buses, or partner buses for SaaS integrations)
- **Rules** — pattern-match on event content to route to targets
- **Targets** — Lambda, Step Functions, SQS, SNS, and 20+ other AWS services
- **Filtering** — rules match on specific fields in the event JSON, avoiding a Lambda having to filter irrelevant events itself
- **Archive & Replay** — store events and replay them later (useful for reprocessing after a bug fix, or backfilling a new consumer)

```
Event (e.g., "OrderPlaced")
   │
   ▼
EventBridge Bus
   │
   ▼
Rule (matches detail-type: "OrderPlaced")
   │
   ▼
Target: Lambda (send confirmation email)
```

**EventBridge vs SNS:** EventBridge supports much richer content-based filtering and has native integrations with many more AWS services and SaaS partners; SNS is simpler pub/sub without the same filtering depth.

---

## Chapter 23 — Step Functions

Orchestrates multi-step workflows (state machines) across Lambda, ECS, SQS, and other services, with built-in retry, error handling, parallel branches, and visual execution history — replacing fragile "Lambda calls Lambda calls Lambda" chains.

```
Start
  │
  ▼
[Validate Order] ──fail──► [Notify Failure] ──► End
  │ success
  ▼
[Charge Payment] ──fail──► [Refund/Rollback] ──► End
  │ success
  ▼
[Ship Order] ──► End
```

Best for: long-running business workflows, Saga-pattern distributed transactions, human-approval steps, and any process needing visibility into exactly where it failed.

---

## Chapter 24 — Data Streaming: Kinesis & MSK (New Pillar)

Messaging (SQS/SNS/EventBridge) is built for discrete events and commands. **Streaming** is a different problem: continuous, ordered, high-throughput data (clickstreams, IoT telemetry, log aggregation, real-time analytics) that multiple consumers need to read **independently and repeatedly**, often replaying from an earlier point.

### Kinesis Data Streams vs Kinesis Data Firehose

|                  | Data Streams                                                       | Firehose                                                                    |
| ---------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| Purpose          | Real-time custom processing                                        | Load streaming data into a destination                                      |
| Consumers        | You write custom consumers (Lambda, KCL apps)                      | Fully managed — no consumer code, delivers to S3/Redshift/OpenSearch/Splunk |
| Retention/Replay | Yes (up to 365 days) — multiple consumers can replay independently | No — it's a one-way delivery pipe, not a replayable log                     |
| Transformation   | Custom, in your consumer code                                      | Built-in (optional Lambda transform) before delivery                        |
| Latency          | Near real-time (seconds)                                           | Near real-time to a few minutes (buffers before delivery)                   |

```
Producers (clickstream, IoT, app logs)
        │
        ▼
Kinesis Data Streams (ordered, replayable, multiple independent consumers)
        │                                   │
        ▼                                   ▼
  Custom Lambda Consumer            Kinesis Data Firehose
  (real-time fraud detection)              │
                                            ▼
                                   S3 / Redshift / OpenSearch
```

### Managed Streaming for Apache Kafka (MSK)

MSK is AWS-managed **Apache Kafka** — for teams that need Kafka specifically (existing Kafka ecosystem/tooling, Kafka Streams/ksqlDB, cross-cloud portability, or an existing team with deep Kafka expertise) rather than AWS's proprietary Kinesis API.

### Streaming vs Messaging — Decision Tree (extends the messaging decision tree)

```
One consumer per message, message consumed once?
   └── Yes → SQS

Many independent subscribers, each gets every message (fan-out)?
   └── Yes → SNS / EventBridge

Need content-based routing across many AWS/SaaS targets?
   └── Yes → EventBridge

Need to replay history, have multiple independent readers processing
the same continuous stream at their own pace, ordered by partition?
   └── Yes → Kinesis Data Streams (AWS-native) or MSK (need Kafka specifically)

Just need to reliably land streaming data into S3/Redshift/OpenSearch
with no custom consumer code?
   └── Yes → Kinesis Data Firehose
```

### Common Mistakes

- Using SQS for analytics/clickstream use cases where multiple independent systems need to replay the same data (SQS messages are gone once consumed — no replay)
- Choosing MSK when the team has no Kafka-specific need — it carries more operational overhead (partitions, brokers, ZooKeeper/KRaft) than Kinesis
- Under-provisioning Kinesis shards, causing `ProvisionedThroughputExceededException` during traffic spikes

### Interview Questions

- **Intermediate:** Kinesis Data Streams vs Firehose — what's the core difference?
- **Senior:** You need three separate systems (fraud detection, real-time dashboard, data warehouse) to each independently process every clickstream event at their own pace. SQS, SNS, or Kinesis? Justify it.

---

## Chapter 25 — SES & Cognito

### SES (Simple Email Service)

Transactional and bulk email sending/receiving at scale, with sending statistics, bounce/complaint handling, and domain verification (DKIM/SPF) for deliverability.

```
Application ──► SES ──► Recipient
                 │
                 └── Bounce/Complaint notifications ──► SNS ──► Lambda (suppress future sends)
```

### Cognito

Managed user authentication and authorization.

- **User Pools** — user directory + sign-up/sign-in + JWT token issuance (your own app's users)
- **Identity Pools** — exchange a token (from a User Pool, Google, Facebook, etc.) for temporary **AWS credentials** to directly access AWS resources (e.g., letting a mobile app upload straight to S3 without a backend in the middle)

```
User Login
   │
   ▼
Cognito User Pool ──► JWT (ID Token, Access Token)
   │
   ▼
Cognito Identity Pool ──► Temporary AWS Credentials (STS)
   │
   ▼
Direct, scoped access to S3 / DynamoDB / etc.
```

### Common Mistakes

- Not verifying a sending domain in SES, landing all outbound email in spam
- Confusing User Pools (authentication) with Identity Pools (AWS resource authorization) — they solve different problems and are often used together

### Interview Questions

- **Beginner:** What's the difference between a Cognito User Pool and an Identity Pool?
- **Intermediate:** How would you handle SES bounce/complaint notifications to keep your sender reputation healthy?

---

### Module 4 of 5 — Governance, DevOps & Day-2 Operations (Chapters 26–39)

> This module covers Secrets Manager, Systems Manager, full observability (CloudWatch, CloudTrail, X-Ray), ECR, modern CI/CD (GitHub Actions/GitLab CI + OIDC — CodeCommit dropped per its deprecation), IaC (Terraform + CDK), the core security services, Well-Architected Framework, and Cost Optimization.

---

## Chapter 26 — Secrets Manager & Systems Manager Parameter Store

### Secrets Manager

Stores secrets (DB credentials, API keys, tokens) encrypted at rest (via KMS), with:

- **Automatic rotation** — built-in rotation Lambdas for RDS/Redshift/DocumentDB, or bring your own rotation function
- **Fine-grained IAM access control** and full CloudTrail audit trail of every secret access
- **Cross-region replication** for multi-region apps

```
Application
   │  (calls GetSecretValue, cached in-memory to avoid throttling)
   ▼
Secrets Manager ──► KMS (decrypt) ──► Returns plaintext secret
   │
   └── Rotation Lambda (runs on schedule) ──► Updates DB password + secret atomically
```

```bash
aws secretsmanager get-secret-value --secret-id prod/db/password
```

```javascript
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ region: "ap-south-1" });
const { SecretString } = await client.send(
  new GetSecretValueCommand({ SecretId: "prod/db/password" }),
);
```

### Systems Manager (SSM) Parameter Store

A simpler, cheaper alternative for configuration and secrets that don't need automatic rotation — supports plaintext `String`/`StringList` and encrypted `SecureString` (via KMS), organized hierarchically (`/myapp/prod/db-host`).

**Secrets Manager vs Parameter Store:**
| | Secrets Manager | Parameter Store |
|---|---|---|
| Cost | Per secret, per API call | Free tier for standard params |
| Rotation | Built-in, automatic | Manual / custom automation |
| Best for | Credentials needing rotation | App config, feature flags, non-rotating secrets |

### Systems Manager — Other Capabilities

- **Session Manager** — shell access to EC2 instances without SSH keys or open port 22 (fully audited via CloudTrail)
- **Run Command** — execute commands across a fleet of instances without SSH
- **Patch Manager** — automate OS/security patching across your fleet

### Common Mistakes

- Storing secrets in Parameter Store as plaintext `String` instead of `SecureString`
- Fetching a secret on every single request instead of caching it in memory for the life of the execution environment (costly and can hit API rate limits)
- Leaving SSH (port 22) open when Session Manager could remove the need for it entirely

### Interview Questions

- **Beginner:** Secrets Manager vs Parameter Store — when would you pick one over the other?
- **Intermediate:** How does Secrets Manager's automatic rotation work for an RDS database?

---

## Chapter 27 — CloudWatch (Full Observability)

### Core Concepts

- **Metrics** — numeric time-series data (CPUUtilization, custom app metrics via `PutMetricData`)
- **Logs** — centralized log storage (Log Groups/Streams), queried via **Logs Insights** (SQL-like query language)
- **Alarms** — trigger actions (SNS notification, Auto Scaling action, Lambda) when a metric crosses a threshold
- **Dashboards** — custom visual views combining metrics/alarms/logs
- **CloudWatch Events** — the legacy predecessor to EventBridge (EventBridge is the modern superset — use EventBridge for new event routing)

### Example — Custom Metric + Alarm

```bash
aws cloudwatch put-metric-data \
  --namespace "MyApp" \
  --metric-name "OrdersProcessed" \
  --value 1

aws cloudwatch put-metric-alarm \
  --alarm-name high-error-rate \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 60 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --alarm-actions arn:aws:sns:ap-south-1:111122223333:ops-alerts
```

### Logs Insights Example Query

```
fields @timestamp, @message
| filter @message like /ERROR/
| sort @timestamp desc
| limit 50
```

---

## Chapter 28 — CloudTrail

Records **every API call** made in your AWS account (who did what, when, from where) — this is your audit log, distinct from CloudWatch (which is metrics/app logs).

```
Any API Call (Console, CLI, SDK, another AWS service)
   │
   ▼
CloudTrail Event (who, what action, source IP, timestamp)
   │
   ▼
Delivered to S3 (long-term audit) + optionally CloudWatch Logs (alerting)
```

**CloudTrail vs CloudWatch (frequent interview confusion):**
| | CloudTrail | CloudWatch |
|---|---|---|
| Tracks | Who did what (API-level audit) | Application/infrastructure metrics & logs |
| Primary use | Security audit, compliance, forensics | Performance monitoring, alerting |

### Common Mistakes

- Not enabling CloudTrail across all regions (a common gap attackers exploit — creating resources in an unmonitored region)
- Not protecting the CloudTrail log bucket itself with strict policies/Object Lock (an attacker's first move is often to disable or tamper with logging)

### Interview Questions

- **Beginner:** What's the core difference between CloudTrail and CloudWatch?
- **Senior:** How would you detect and prevent someone disabling CloudTrail logging in a compromised account? _(Ties back to SCPs from Chapter 02.)_

---

## Chapter 29 — AWS X-Ray

Distributed tracing — visualizes the full path of a request across multiple services (API Gateway → Lambda → DynamoDB → SQS), showing latency at each hop and pinpointing exactly where a slow or failing request breaks down.

```
Request
  │
  ▼
[API Gateway: 5ms] → [Lambda: 120ms] → [DynamoDB: 80ms] → [SNS: 10ms]
                                              │
                                        (this hop is the bottleneck — visible in the trace)
```

Best for: diagnosing latency in microservices/serverless architectures where a single request touches many services and "which service is actually slow" isn't obvious from individual service logs alone.

---

## Chapter 30 — ECR (Elastic Container Registry)

Fully managed Docker/OCI container image registry, integrated with IAM (image-level access control) and ECS/EKS/Lambda (container image support).

```bash
aws ecr get-login-password --region ap-south-1 | \
  docker login --username AWS --password-stdin 111122223333.dkr.ecr.ap-south-1.amazonaws.com

docker build -t my-app .
docker tag my-app:latest 111122223333.dkr.ecr.ap-south-1.amazonaws.com/my-app:latest
docker push 111122223333.dkr.ecr.ap-south-1.amazonaws.com/my-app:latest
```

**Image scanning** — ECR can automatically scan pushed images for known CVEs, blocking deployment of vulnerable images before they reach production.

---

## Chapter 31 — CI/CD: Modern Pipelines (CodeCommit Removed)

> **Update:** AWS has stopped onboarding new customers to **CodeCommit** — do not plan new architectures around it. The modern standard is **GitHub Actions** or **GitLab CI**, authenticating to AWS via **OIDC (OpenID Connect) federated roles** instead of long-lived IAM access keys.

### Why OIDC Instead of Access Keys

Long-lived IAM access keys stored as CI secrets are a major breach vector — if leaked, they're valid until manually rotated. **OIDC federation** lets GitHub Actions/GitLab CI request short-lived, automatically-expiring AWS credentials at pipeline run-time, with zero long-lived secrets stored anywhere.

```
GitHub Actions Workflow Run
   │  (presents a signed OIDC token identifying the exact repo/branch)
   ▼
AWS IAM OIDC Identity Provider (trusts GitHub's OIDC issuer)
   │
   ▼
IAM Role (trust policy scoped to specific repo/branch) ──► STS AssumeRoleWithWebIdentity
   │
   ▼
Short-lived temporary credentials (expire automatically, nothing to leak long-term)
```

### GitHub Actions + OIDC Example

IAM role trust policy (only this specific repo/branch can assume it):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::111122223333:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:my-org/my-app:ref:refs/heads/main"
        }
      }
    }
  ]
}
```

GitHub Actions workflow:

```yaml
name: Deploy
on:
  push:
    branches: [main]

permissions:
  id-token: write # required for OIDC
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::111122223333:role/github-actions-deploy
          aws-region: ap-south-1

      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster prod --service my-app --force-new-deployment
```

### Deployment Strategies (still relevant regardless of pipeline tool)

- **Blue/Green** — new version deployed alongside old, traffic switched atomically, easy instant rollback
- **Rolling** — gradually replace old instances/tasks with new ones
- **Canary** — small percentage of traffic shifted to new version first, gradually increased while monitoring error rates

```
Blue (v1, live)          Green (v2, new)
100% traffic  ─────►    0% traffic
        │  (switch)
        ▼
0% traffic               100% traffic
```

### Where CodePipeline/CodeBuild/CodeDeploy Still Fit

For teams fully inside the AWS ecosystem without existing GitHub/GitLab investment, **CodePipeline + CodeBuild + CodeDeploy** remain valid AWS-native options — but for most modern teams (and per your note), GitHub Actions/GitLab CI with OIDC roles is the more common real-world default, especially since source code already lives on GitHub/GitLab for the vast majority of teams.

### Common Mistakes

- Storing long-lived AWS access keys as CI secrets instead of using OIDC
- An overly broad OIDC trust policy (`sub: repo:my-org/*`) letting any repo in the org assume a production deploy role
- No environment-specific roles — using the same deploy role for `staging` and `prod`

### Interview Questions

- **Beginner:** Why is OIDC federation preferred over storing AWS access keys in CI secrets?
- **Intermediate:** Walk through what happens when a GitHub Actions workflow assumes an AWS role via OIDC.
- **Senior:** Design a CI/CD pipeline for a multi-account setup (staging/prod as separate AWS accounts) using GitHub Actions and OIDC, ensuring a compromised staging pipeline can never deploy to prod.

---

## Chapter 32 — Infrastructure as Code: Terraform & AWS CDK

### Terraform

Cloud-agnostic, declarative IaC using HCL — the most widely adopted multi-cloud IaC tool, large community/module ecosystem.

```hcl
resource "aws_s3_bucket" "assets" {
  bucket = "my-app-assets"
}
```

### AWS CDK (Cloud Development Kit)

Write infrastructure using **actual programming languages** (TypeScript, Python, Java, etc.) instead of a declarative config language — CDK compiles down to CloudFormation. This lets you use loops, conditionals, functions, and existing type systems/IDE tooling directly for infra definitions, and share logic as reusable constructs (versioned like any other library).

```typescript
import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";

export class AppStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string) {
    super(scope, id);

    new s3.Bucket(this, "AssetsBucket", {
      bucketName: "my-app-assets",
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
    });
  }
}
```

### Terraform vs CDK — When to Choose Which

|                   | Terraform                                          | CDK                                                                             |
| ----------------- | -------------------------------------------------- | ------------------------------------------------------------------------------- |
| Language          | HCL (declarative)                                  | TypeScript/Python/Java/etc. (imperative, compiles to CloudFormation)            |
| Multi-cloud       | Yes (AWS, GCP, Azure, etc.)                        | AWS only (there's also CDK for Terraform / cdktf)                               |
| Team fit          | Ops/platform teams, multi-cloud shops              | App teams already fluent in TS/Python who want infra defined alongside app code |
| State management  | Its own state file (S3 + DynamoDB lock, typically) | Delegates to CloudFormation's native state tracking                             |
| Abstraction reuse | Modules                                            | Constructs (real classes/functions — more powerful composition)                 |

**Enterprise reality (per your note):** many teams now prefer writing infra in TypeScript/Python (CDK) over HCL (Terraform) specifically because it lets application engineers—not just a dedicated platform team—comfortably read and contribute to infra code using languages they already know, with full IDE autocomplete and type checking.

### Common Mistakes

- Manually editing resources in the AWS Console that are managed by Terraform/CDK, causing state drift
- Not remotely storing/locking Terraform state (local state files cause conflicts and data loss with more than one engineer)
- Mixing CDK and hand-written CloudFormation/Terraform managing the same resources

### Interview Questions

- **Beginner:** What problem does Infrastructure as Code solve that manual console clicking doesn't?
- **Intermediate:** Terraform vs CDK — what's the core tradeoff in how they define infrastructure?
- **Senior:** Your team is entirely TypeScript engineers with no HCL experience, moving fast on a new product. Terraform or CDK? Justify it, including how you'd handle state/drift.

---

## Chapter 33 — Well-Architected Framework

The six pillars AWS uses to evaluate architecture quality:

1. **Operational Excellence** — run and monitor systems, continuously improve processes
2. **Security** — protect data, systems, and assets (least privilege, defense in depth)
3. **Reliability** — recover from failures, meet demand dynamically
4. **Performance Efficiency** — use resources efficiently, adapt as requirements evolve
5. **Cost Optimization** — avoid unnecessary spend, understand cost drivers
6. **Sustainability** — minimize environmental impact of workloads

**Interview framing:** these six pillars are frequently used as the structure for a system-design answer itself — after describing an architecture, walk through how it holds up against each pillar.

---

## Chapter 34 — Security Services

| Service                       | Purpose                                                                                                                                            |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **KMS**                       | Managed encryption key creation/rotation, used by nearly every other AWS service for encryption at rest                                            |
| **Secrets Manager**           | (Covered in Ch 26)                                                                                                                                 |
| **ACM (Certificate Manager)** | Free, auto-renewing TLS certificates for ALB/CloudFront                                                                                            |
| **WAF**                       | Web Application Firewall — blocks common web exploits (SQLi, XSS) at the ALB/CloudFront/API Gateway layer via rule-based filtering                 |
| **Shield**                    | DDoS protection (Standard is automatic/free; Advanced adds 24/7 DDoS response team + cost protection)                                              |
| **GuardDuty**                 | ML-based threat detection across CloudTrail, VPC Flow Logs, DNS logs (e.g., detects credential compromise, crypto-mining, port scanning)           |
| **Inspector**                 | Automated vulnerability scanning for EC2, ECR images, and Lambda functions                                                                         |
| **Macie**                     | ML-based discovery of sensitive data (PII) in S3                                                                                                   |
| **Security Hub**              | Aggregates findings from GuardDuty, Inspector, Macie, and third-party tools into one dashboard, mapped against compliance standards (CIS, PCI-DSS) |

```
GuardDuty ──┐
Inspector ───┼──► Security Hub (aggregated findings + compliance scoring)
Macie ───────┘
```

### Interview Questions

- **Intermediate:** WAF vs Shield — what layer of attack does each protect against?
- **Senior:** Design a layered security posture for a public-facing web app using WAF, Shield, GuardDuty, and Security Hub, and explain what each layer catches that the others don't.

---

## Chapter 35 — Cost Optimization

### Key Levers

- **Reserved Instances / Savings Plans** — commit to steady-state usage for a discount (see Ch 05 for the full purchasing options table)
- **Spot Instances** — for fault-tolerant workloads (see Ch 05)
- **Budgets** — set spend thresholds with automatic alerts
- **Cost Explorer** — visualize and break down spend by service/tag/account over time
- **Trusted Advisor** — automated recommendations across cost, security, performance, and fault tolerance
- **Storage Class selection** — right-tiering S3/EBS reduces storage cost significantly with no functional change
- **Rightsizing** — matching instance/database size to actual observed utilization, not provisioned-for-peak-forever

### Common Mistakes

- Provisioning for peak load 24/7 instead of using Auto Scaling to match actual demand
- Leaving unattached EBS volumes and unused Elastic IPs running (small but adds up across large accounts)
- Not tagging resources by team/project, making it impossible to attribute cost later

### Interview Questions

- **Senior:** You're asked to reduce AWS spend by 40% without impacting reliability. Walk through your approach (audit → quick wins → structural changes).

---

### Module 5 of 5 — Capstone Architectures & Career Readiness (Chapters 40–44)

> Brings together Modules 1–4 into end-to-end system designs, the complete decision-tree set (updated with streaming + service mesh + IaC choices), real production incident stories, tiered interview questions, and quick-reference cheat sheets.

---

## Chapter 40 — Production Architectures

### 1. Modern SaaS Architecture (updated with Aurora + OIDC deploy path)

```
User
  │
  ▼
Route53 (latency-based routing)
  │
  ▼
CloudFront (OAC → private S3 for static assets)
  │
  ▼
ALB
  │
  ▼
ECS Fargate Service (Cloud Map for internal service discovery)
  │
  ├──► ElastiCache Serverless (Valkey) — session/cache
  │
  └──► Aurora Serverless v2 (PostgreSQL-compatible)
             │
             └── Aurora Global Database (DR secondary region)

Deploy path: GitHub Actions ──OIDC──► IAM Role ──► ECS Blue/Green Deployment
```

### 2. Serverless API

```
User
  │
  ▼
API Gateway (HTTP API, JWT Authorizer via Cognito)
  │
  ▼
Lambda (Provisioned Concurrency for latency-sensitive paths)
  │
  ▼
DynamoDB (GSI for secondary access patterns)
  │
  └── DynamoDB Streams ──► Lambda ──► EventBridge ──► downstream consumers
```

### 3. Event-Driven Order Processing

```
Order Placed
   │
   ▼
EventBridge Bus
   │
   ├──► Lambda (charge payment) ──Destinations──► SNS (success) / SQS DLQ (failure)
   ├──► Lambda (update inventory)
   └──► Step Functions (fulfillment workflow: pick → pack → ship, with retries)
```

### 4. Reliable Image/Video Upload Pipeline

```
Browser
  │
  ▼
Pre-Signed S3 URL (via API call to backend, avoiding routing large files through your servers)
  │
  ▼
S3 (Multipart Upload for large files)
  │
  ▼
S3 Event Notification
  │
  ▼
Lambda (generate thumbnail / transcode)
  │
  ▼
S3 (processed output) ──► CloudFront (OAC) ──► User
```

### 5. Microservices with Governed Multi-Account Structure

```
AWS Organizations
  ├── OU: Production (SCP: region lock, deny disable-logging)
  │      │
  │      ▼
  │   ALB → Auth Service → User Service → Order Service → Payment Service
  │              (Cloud Map service discovery, App Mesh for mTLS + retries)
  │                                            │
  │                                            ▼
  │                                          SQS ──► Aurora
  │
  ├── OU: Staging (Aurora clone of prod for realistic testing)
  └── OU: Security (GuardDuty, Security Hub aggregation, cross-account read-only audit role)
```

### 6. Real-Time Analytics Pipeline (the new streaming pillar in action)

```
Clickstream / IoT Events
   │
   ▼
Kinesis Data Streams (ordered, replayable)
   │
   ├──► Lambda Consumer (real-time fraud scoring)
   └──► Kinesis Data Firehose ──► S3 ──► (batch analytics / Redshift)
```

---

## Chapter 41 — Decision Trees (Complete Set)

### Which Compute?

```
Need full OS control / legacy software / specialized hardware?
   └── EC2

Need containers, simplest AWS-native orchestration?
   └── ECS (+ Fargate if you don't want to manage EC2 at all)

Need Kubernetes-native APIs / multi-cloud portability?
   └── EKS (+ Fargate optionally)

Event-driven, short-lived, no server management at all?
   └── Lambda

Job-based batch/parallel computing, not request/response?
   └── AWS Batch
```

### Which Database?

```
Relational, need joins/transactions, want max compatibility?
   └── RDS (standard engine)

Relational, want cloud-native performance/HA/fast cloning/global reads?
   └── Aurora (Serverless v2 if traffic is unpredictable)

NoSQL, key-value/document, need massive scale + single-digit ms latency?
   └── DynamoDB

Need an in-memory cache / session store / leaderboard / pub-sub?
   └── ElastiCache (Valkey for rich data structures, Memcached for pure simple caching)

Analytical / data warehouse queries over huge datasets?
   └── Redshift
```

### Which Messaging or Streaming?

```
One consumer processes each message once?
   └── SQS (FIFO if strict ordering + exactly-once matters)

Many independent subscribers need every message (fan-out)?
   └── SNS

Need content-based routing to many AWS/SaaS targets?
   └── EventBridge

Long-running multi-step workflow needing retries/branching/visibility?
   └── Step Functions

Multiple independent consumers need to replay a continuous, ordered
stream at their own pace (analytics, real-time processing)?
   └── Kinesis Data Streams (AWS-native) or MSK (need Kafka specifically)

Just need to land streaming data into S3/Redshift/OpenSearch,
no custom consumer code?
   └── Kinesis Data Firehose
```

### Which Storage?

```
Object storage, HTTP-accessed, effectively unlimited scale?
   └── S3

Block storage attached to a single EC2 instance?
   └── EBS

Shared file system across many EC2 instances/containers?
   └── EFS

Long-term archive, rarely accessed, lowest cost?
   └── S3 Glacier / Glacier Deep Archive
```

### Which Load Balancer?

```
HTTP/HTTPS routing, path/host-based rules, WebSocket?
   └── ALB

Raw TCP/UDP, extreme throughput, static IP requirement?
   └── NLB

Inserting a third-party network appliance transparently?
   └── GWLB

Considering CLB?
   └── Don't — legacy/deprecated. Use ALB or NLB.
```

### Which IaC Tool?

```
Multi-cloud, ops/platform team owns infra, large existing module ecosystem?
   └── Terraform

App engineers want infra defined in a language they already use
(TypeScript/Python), with real logic/reuse via classes?
   └── AWS CDK
```

### Do You Need a Service Mesh?

```
Few services, simple internal calls?
   └── No — Cloud Map for service discovery is enough

Many services, need consistent retries/circuit-breaking/mTLS/
cross-service observability as an operational necessity?
   └── Yes — App Mesh (AWS-native) or Istio (K8s ecosystem/portability)
```

---

## Chapter 42 — Real Production Incident Stories

**Story 1 — Traffic spike during a flash sale**
Symptom: ALB 5xx errors, EC2 fleet at 100% CPU.
Fix: CloudFront in front of static assets to offload origin traffic + Target Tracking Auto Scaling on the ALB request-count-per-target metric + pre-warming via Scheduled Scaling ahead of the known sale start time.

**Story 2 — Database CPU pinned at 95%**
Symptom: Slow API responses, RDS CPU alarm firing continuously.
Fix: Added Read Replicas for reporting/analytics queries to separate them from transactional load, plus ElastiCache in front of the hottest read queries. Root cause found via Performance Insights: a missing index causing full table scans.

**Story 3 — Users uploading 500MB videos failing on mobile networks**
Symptom: Uploads failing partway through, no resume capability.
Fix: Switched to S3 Multipart Upload with client-side retry per part, and pre-signed URLs generated per part rather than a single URL for the whole file.

**Story 4 — Background email processing backing up**
Symptom: Users complaining about delayed confirmation emails.
Fix: SQS decoupling the request path from email sending + Lambda consumer + SES, with a DLQ + CloudWatch alarm on DLQ depth so failures are visible immediately instead of silently dropped.

**Story 5 — Payment service outage cascading to the whole checkout flow**
Symptom: One downstream dependency failure took down unrelated services.
Fix: SQS-based decoupling with DLQ + retry, plus a circuit breaker pattern in the calling service to fail fast instead of piling up blocked threads/connections waiting on the dead dependency.

**Story 6 — A leaked CI access key gave an attacker deploy access to production**
Symptom: Unauthorized ECS deployment discovered via CloudTrail.
Fix: Migrated CI/CD from long-lived IAM access keys to GitHub Actions OIDC federation with per-environment, per-repo/branch-scoped roles — eliminating any long-lived credential that could be exfiltrated from CI in the first place.

**Story 7 — An engineer accidentally disabled CloudTrail logging in a dev account**
Symptom: Gap in the audit log discovered during a security review.
Fix: Applied an AWS Organizations SCP across all OUs denying `cloudtrail:StopLogging` and `cloudtrail:DeleteTrail`, regardless of the IAM permissions any individual account admin holds.

---

## Chapter 43 — Interview Questions (By Experience Level)

### Beginner

- What is EC2, and how does it differ from a traditional physical server?
- Difference between S3 and EBS?
- What is IAM, and what's the difference between a Role and a User?
- What is a VPC, and why does it exist?
- What is an Availability Zone, and how is it different from a Region?
- What's the difference between a Cognito User Pool and Identity Pool?

### Intermediate

- ALB vs NLB — when would you choose each?
- SQS vs SNS vs EventBridge — how do you decide?
- Why do Lambda cold starts happen, and how do you mitigate them?
- RDS Multi-AZ vs Read Replica — what's the difference, and can Multi-AZ serve read traffic?
- NAT Gateway vs Internet Gateway?
- Security Groups vs NACLs — state vs stateless, instance vs subnet level.
- ECS vs EKS — what's the real tradeoff for a team choosing between them?
- DynamoDB Partition Keys — how do you avoid a hot partition?
- Why is OAC preferred over OAI when securing a CloudFront-to-S3 origin?
- Kinesis Data Streams vs Firehose — what's the core difference?
- Why is OIDC federation preferred over long-lived IAM access keys in CI/CD?

### Senior

- Design a video streaming platform end-to-end (ingestion, transcoding, delivery, DR).
- Design a scalable multi-tenant SaaS architecture, including data isolation strategy.
- Handle 10 million requests/day — walk through your capacity planning and scaling strategy.
- Reduce AWS costs by 40% without impacting reliability — what's your approach?
- Design for zero-downtime deployments across a microservices fleet.
- Design a multi-region disaster recovery strategy using Aurora Global Database and Route53 failover routing — state your RPO/RTO.
- Secure a production AWS account end-to-end: IAM, SCPs, GuardDuty, Security Hub, CloudTrail protection.
- At what point would you introduce a service mesh, and what would you evaluate before doing so?
- Design a CI/CD pipeline across separate staging/prod AWS accounts using GitHub Actions + OIDC, ensuring a compromised staging pipeline can never reach production.
- Three independent systems need to process every event from a clickstream at their own pace, with replay capability — justify your messaging/streaming choice.

---

## Chapter 44 — Master Cheat Sheets

### Compute at a Glance

| Need                             | Service           |
| -------------------------------- | ----------------- |
| Full control, custom OS/software | EC2               |
| Simplest container orchestration | ECS (+ Fargate)   |
| Kubernetes-native                | EKS (+ Fargate)   |
| Event-driven, no servers         | Lambda            |
| Batch/parallel jobs              | AWS Batch         |
| Fast PaaS deploy, minimal config | Elastic Beanstalk |

### Database at a Glance

| Need                                                   | Service                        |
| ------------------------------------------------------ | ------------------------------ |
| Relational, standard engine                            | RDS                            |
| Relational, cloud-native, HA, fast clone, global reads | Aurora                         |
| NoSQL, massive scale, low latency                      | DynamoDB                       |
| In-memory cache/session                                | ElastiCache (Valkey/Memcached) |
| Data warehouse                                         | Redshift                       |

### Messaging/Streaming at a Glance

| Need                                                    | Service                    |
| ------------------------------------------------------- | -------------------------- |
| Single consumer, once each                              | SQS                        |
| Fan-out to many subscribers                             | SNS                        |
| Content-based routing, many targets                     | EventBridge                |
| Long workflow orchestration                             | Step Functions             |
| Replayable ordered stream, multiple independent readers | Kinesis Data Streams / MSK |
| Streaming data landed into a data store, no custom code | Kinesis Data Firehose      |

### Security Quick Reference

| Layer                           | Service                  |
| ------------------------------- | ------------------------ |
| Encryption keys                 | KMS                      |
| Rotating credentials            | Secrets Manager          |
| Non-rotating config/secrets     | SSM Parameter Store      |
| TLS certificates                | ACM                      |
| Web exploit filtering           | WAF                      |
| DDoS protection                 | Shield                   |
| Threat detection                | GuardDuty                |
| Vulnerability scanning          | Inspector                |
| Sensitive data discovery        | Macie                    |
| Aggregated compliance dashboard | Security Hub             |
| Multi-account guardrails        | AWS Organizations + SCPs |
| API-level audit trail           | CloudTrail               |

### CI/CD Quick Reference

| Need                                        | Use                                                         |
| ------------------------------------------- | ----------------------------------------------------------- |
| Source-controlled deploy from GitHub        | GitHub Actions + OIDC role                                  |
| Source-controlled deploy from GitLab        | GitLab CI + OIDC role                                       |
| Fully AWS-native pipeline (legacy-friendly) | CodePipeline + CodeBuild + CodeDeploy                       |
| ❌ New source repos                         | CodeCommit — do not use, no longer onboarding new customers |

---
