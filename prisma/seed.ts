import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { randomUUID } from 'crypto'

async function seed() {
  console.log("🌱 Seeding database...")

  const meta = await db.seedMeta.findUnique({ where: { id: "singleton" } })
  if (meta?.seeded) {
    console.log("✅ Already seeded, skipping...")
    return
  }

  const password = await hashPassword("password123")

  // ── ADMIN ──
  const admin = await db.user.create({
    data: { name: "JobReady Admin", email: "admin@jobready.co.ke", password, role: "ADMIN", isActive: true },
  })

  // ── SAFARICOM ──
  const safUser = await db.user.create({
    data: { name: "Grace Mwangi", email: "safaricom@safaricom.co.ke", password, phone: "+254 720 100 200", role: "EMPLOYER", isActive: true },
  })
  const safaricom = await db.company.create({
    data: { name: "Safaricom PLC", slug: "safaricom-plc", email: "careers@safaricom.co.ke", phone: "+254 720 222 222", website: "https://safaricom.co.ke", description: "Leading communications company in Kenya.", industry: "Telecommunications", size: "201-500", orgType: "PRIVATE", county: "Nairobi", address: "Safaricom House, Waiyaki Way, Nairobi", isVerified: true },
  })
  await db.companyMember.create({ data: { userId: safUser.id, companyId: safaricom.id, role: "OWNER" } })
  const safHR = await db.user.create({ data: { name: "John Kariuki", email: "john.k@safaricom.co.ke", password, role: "EMPLOYER", isActive: true } })
  await db.companyMember.create({ data: { userId: safHR.id, companyId: safaricom.id, role: "RECRUITER" } })

  const safJobs = await Promise.all([
    db.job.create({ data: { title: "Senior Backend Engineer", slug: "senior-backend-engineer-saf", description: "Design, develop and maintain scalable backend systems powering M-Pesa and other Safaricom services.", requirements: "7+ years in backend development\nNode.js/Go/Java proficiency\nExperience with microservices\nDatabase design (PostgreSQL, Redis, Kafka)\nCI/CD and cloud infrastructure", howToApply: "Send your CV to careers@safaricom.co.ke.", location: "Westlands", county: "Nairobi", type: "Full-Time", experience: "senior", category: "IT", salaryMin: 200000, salaryMax: 350000, status: "ACTIVE", companyId: safaricom.id, views: 892, closingDate: new Date(Date.now() + 30*24*60*60*1000) } }),
    db.job.create({ data: { title: "Data Analyst", slug: "data-analyst-saf", description: "Derive insights from customer data, build dashboards, and support data-driven decision making.", requirements: "3+ years in data analytics\nSQL, Python, Tableau/Power BI\nStatistical analysis experience", howToApply: "Apply via careers@safaricom.co.ke.", location: "Kilimani", county: "Nairobi", type: "Full-Time", experience: "mid", category: "IT", salaryMin: 120000, salaryMax: 180000, isRemote: true, status: "ACTIVE", companyId: safaricom.id, views: 445, closingDate: new Date(Date.now() + 14*24*60*60*1000) } }),
    db.job.create({ data: { title: "Customer Service Representative", slug: "customer-service-rep-saf", description: "Handle customer inquiries via phone, email and chat.", requirements: "Diploma or degree\nExcellent communication in English and Swahili\nCustomer service experience preferred", howToApply: "Walk in with your CV to Safaricom Customer Service Center.", location: "Nairobi CBD", county: "Nairobi", type: "Full-Time", experience: "entry", category: "Administration", salaryMin: 40000, salaryMax: 60000, status: "PENDING_REVIEW", companyId: safaricom.id, closingDate: new Date(Date.now() + 7*24*60*60*1000) } }),
  ])

  await Promise.all([
    db.jobApplication.create({ data: { jobId: safJobs[0].id, applicantName: "Samuel Kamau", applicantEmail: "samuel.k@gmail.com", applicantPhone: "+254 723 456 789", status: "reviewing", coverLetter: "I am writing to express my interest in the Senior Backend Engineer position. With 8 years of experience in Node.js and microservices.", cvUrl: "/sample-cv.pdf", appliedAt: new Date(Date.now() - 1*24*60*60*1000) } }),
    db.jobApplication.create({ data: { jobId: safJobs[0].id, applicantName: "Kevin Ochieng", applicantEmail: "kevin.o@yahoo.com", applicantPhone: "+254 745 678 901", status: "shortlisted", coverLetter: "Strong experience in Go and Kafka.", cvUrl: "/sample-cv.pdf", appliedAt: new Date(Date.now() - 3*24*60*60*1000) } }),
    db.jobApplication.create({ data: { jobId: safJobs[1].id, applicantName: "Faith Njeri", applicantEmail: "faith.n@gmail.com", applicantPhone: "+254 756 789 012", status: "pending", coverLetter: "Recently completed data science certification.", cvUrl: "/sample-cv.pdf", appliedAt: new Date(Date.now() - 1*24*60*60*1000) } }),
    db.jobApplication.create({ data: { jobId: safJobs[0].id, applicantName: "Brian Wanyama", applicantEmail: "brian.w@gmail.com", applicantPhone: "+254 789 012 345", status: "rejected", cvUrl: "/sample-cv.pdf", appliedAt: new Date(Date.now() - 5*24*60*60*1000) } }),
    db.jobApplication.create({ data: { jobId: safJobs[1].id, applicantName: "Lucy Wambui", applicantEmail: "lucy.w@outlook.com", applicantPhone: "+254 778 901 234", status: "hired", cvUrl: "/sample-cv.pdf", appliedAt: new Date(Date.now() - 10*24*60*60*1000) } }),
  ])

  // ── EQUITY BANK ──
  const eqUser = await db.user.create({ data: { name: "Margaret Odhiambo", email: "equity@equitybank.co.ke", password, phone: "+254 733 200 300", role: "EMPLOYER", isActive: true } })
  const equity = await db.company.create({ data: { name: "Equity Bank Kenya", slug: "equity-bank-kenya", email: "hr@equitybank.co.ke", phone: "+254 733 100 000", website: "https://equitybank.co.ke", description: "Financial services group offering banking, insurance, and investment services.", industry: "Banking & Finance", size: "500+", orgType: "PRIVATE", county: "Nairobi", address: "Equity Centre, Nairobi" } })
  await db.companyMember.create({ data: { userId: eqUser.id, companyId: equity.id, role: "OWNER" } })

  const eqJobs = await Promise.all([
    db.job.create({ data: { title: "Relationship Manager - SME Banking", slug: "relationship-manager-sme", description: "Manage and grow relationships with SME clients.", requirements: "Bachelor's in Business/Finance\n3+ years in relationship banking", howToApply: "Apply at careers.equitybank.co.ke.", location: "Nairobi", county: "Nairobi", type: "Full-Time", experience: "mid", category: "Finance", salaryMin: 80000, salaryMax: 150000, status: "ACTIVE", companyId: equity.id, views: 234, closingDate: new Date(Date.now() + 21*24*60*60*1000) } }),
    db.job.create({ data: { title: "Branch Manager - Kisumu", slug: "branch-manager-kisumu", description: "Oversee daily operations of the Kisumu branch.", requirements: "5+ years in banking operations\nLeadership and team management", howToApply: "Submit via careers.equitybank.co.ke.", location: "Kisumu", county: "Kisumu", type: "Full-Time", experience: "senior", category: "Finance", salaryMin: 150000, salaryMax: 250000, status: "REJECTED", rejectionReason: "Duplicate posting.", companyId: equity.id, reviewedBy: admin.id, reviewedAt: new Date(Date.now() - 2*24*60*60*1000) } }),
  ])

  await Promise.all([
    db.jobApplication.create({ data: { jobId: eqJobs[0].id, applicantName: "Dennis Kipruto", applicantEmail: "dennis.k@gmail.com", status: "pending", cvUrl: "/sample-cv.pdf", appliedAt: new Date(Date.now() - 2*24*60*60*1000) } }),
    db.jobApplication.create({ data: { jobId: eqJobs[0].id, applicantName: "Anita Akinyi", applicantEmail: "anita.a@gmail.com", status: "reviewing", cvUrl: "/sample-cv.pdf", appliedAt: new Date(Date.now() - 4*24*60*60*1000) } }),
    db.jobApplication.create({ data: { jobId: eqJobs[0].id, applicantName: "James Mwangi", applicantEmail: "james.m@outlook.com", status: "pending", cvUrl: "/sample-cv.pdf", appliedAt: new Date(Date.now()) } }),
  ])

  // ── PAYMENTS ──
  await Promise.all([
    db.payment.create({ data: { companyId: safaricom.id, reference: "PAY-SAF-001", amount: 20000, purpose: "featured_listing", status: "paid", paidAt: new Date(Date.now() - 10*24*60*60*1000) } }),
    db.payment.create({ data: { companyId: equity.id, reference: "PAY-EQ-001", amount: 10000, purpose: "featured_listing", status: "pending" } }),
  ])

  // ── NOTIFICATIONS ──
  await Promise.all([
    db.notification.create({ data: { userId: safUser.id, type: "APPLICATION_UPDATE", title: "New Application", message: "Samuel Kamau applied for Senior Backend Engineer", link: "/dashboard/applications" } }),
    db.notification.create({ data: { userId: safUser.id, type: "APPLICATION_UPDATE", title: "Application Shortlisted", message: "Kevin Ochieng shortlisted for Senior Backend Engineer", link: "/dashboard/applications" } }),
    db.notification.create({ data: { userId: safUser.id, type: "JOB_APPROVED", title: "Job Approved", message: "Your job 'Senior Backend Engineer' has been approved!", link: "/dashboard/jobs" } }),
    db.notification.create({ data: { userId: eqUser.id, type: "JOB_REJECTED", title: "Job Rejected", message: "Your job 'Branch Manager - Kisumu' was rejected. Duplicate posting.", link: "/dashboard/jobs" } }),
    db.notification.create({ data: { userId: eqUser.id, type: "SYSTEM", title: "Welcome!", message: "Your employer account has been set up. Start posting jobs.", link: "/dashboard" } }),
  ])

  // ── INVITATIONS & AUDIT ──
  await Promise.all([
    db.companyInvitation.create({ data: { email: "mary@safaricom.co.ke", companyId: safaricom.id, role: "ADMIN", token: randomUUID(), invitedBy: safUser.id, expiresAt: new Date(Date.now() + 5*24*60*60*1000) } }),
    db.adminAuditLog.create({ data: { userId: admin.id, action: "JOB_APPROVED", target: safJobs[0].id, details: JSON.stringify({ title: safJobs[0].title }) } }),
    db.adminAuditLog.create({ data: { userId: admin.id, action: "JOB_APPROVED", target: safJobs[1].id, details: JSON.stringify({ title: safJobs[1].title }) } }),
    db.adminAuditLog.create({ data: { userId: admin.id, action: "JOB_REJECTED", target: eqJobs[1].id, details: JSON.stringify({ title: eqJobs[1].title, reason: "Duplicate" }) } }),
  ])

  await db.seedMeta.upsert({ where: { id: "singleton" }, update: { seeded: true }, create: { seeded: true } })

  console.log("✅ Database seeded successfully!")
  console.log("   ADMIN:     admin@jobready.co.ke / password123")
  console.log("   EMPLOYER:  safaricom@safaricom.co.ke / password123")
  console.log("   EMPLOYER:  equity@equitybank.co.ke / password123")
}

seed().catch((e) => { console.error("❌ Seed failed:", e); process.exit(1) }).finally(async () => { await db.$disconnect() })
