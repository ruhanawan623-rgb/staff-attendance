/**
 * EduTrack Pro - Realistic Initial Seed Data
 * Generates comprehensive mock data for school administration
 */

const SEED_DATA = {
  settings: {
    schoolName: "Staff Attendance",
    schoolMotto: "Excellence in Attendance Management",
    schoolLogo: "💼",
    academicYear: "2025-2026",
    currentTerm: "Term 1 (Fall)",
    principalName: "Dr. Arthur Pendelton",
    email: "admin@stxaviers-academy.edu",
    phone: "+1 (555) 234-5678",
    address: "742 Evergreen Terrace, Springfield, OR",
    minAttendancePercent: 75,
    lateToleranceMinutes: 15,
    departments: [
      "Mathematics",
      "Science",
      "English Literature",
      "Social Studies & History",
      "Computer Science & IT",
      "Physical Education",
      "Arts & Music",
      "Administration & Support"
    ],
    classes: [
      { name: "Grade 8", sections: ["A", "B"] },
      { name: "Grade 9", sections: ["A", "B", "C"] },
      { name: "Grade 10", sections: ["A", "B", "C"] },
      { name: "Grade 11", sections: ["A (Science)", "B (Commerce)", "C (Arts)"] },
      { name: "Grade 12", sections: ["A (Science)", "B (Commerce)", "C (Arts)"] }
    ],
    leaveTypes: [
      "Medical / Sick Leave",
      "Casual / Personal Leave",
      "Family Emergency",
      "Academic / Sports Event",
      "Bereavement",
      "Maternity / Paternity"
    ]
  },

  users: [
    {
      id: "USR-001",
      name: "Dr. Eleanor Vance",
      email: "admin@school.edu",
      password: "password123",
      role: "admin",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      title: "System Administrator / Principal"
    },
    {
      id: "USR-002",
      name: "Prof. Marcus Thorne",
      email: "teacher@school.edu",
      password: "password123",
      role: "teacher",
      staffId: "STF-101",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
      title: "Head of Science / Grade 10-A Class Teacher"
    },
    {
      id: "USR-003",
      name: "Sarah Jenkins",
      email: "staff@school.edu",
      password: "password123",
      role: "staff",
      staffId: "STF-107",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      title: "Senior Administrative Officer"
    }
  ],

  staff: [
    {
      id: "STF-101",
      name: "Prof. Marcus Thorne",
      gender: "Male",
      designation: "Senior Science Teacher",
      department: "Science",
      email: "marcus.thorne@stxaviers-academy.edu",
      phone: "+1 (555) 301-4411",
      joiningDate: "2020-08-15",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
      status: "Active",
      qualification: "M.Sc. Physics, B.Ed",
      assignedClass: "Grade 10 - Section A"
    },
    {
      id: "STF-102",
      name: "Dr. Clara Oswald",
      gender: "Female",
      designation: "Mathematics HOD",
      department: "Mathematics",
      email: "clara.oswald@stxaviers-academy.edu",
      phone: "+1 (555) 302-8822",
      joiningDate: "2018-06-01",
      avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80",
      status: "Active",
      qualification: "Ph.D. Applied Mathematics",
      assignedClass: "Grade 11 - Section A (Science)"
    },
    {
      id: "STF-103",
      name: "David Kim",
      gender: "Male",
      designation: "Lead IT & CS Instructor",
      department: "Computer Science & IT",
      email: "david.kim@stxaviers-academy.edu",
      phone: "+1 (555) 303-9933",
      joiningDate: "2021-01-10",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      status: "Active",
      qualification: "M.S. Computer Science",
      assignedClass: "Grade 12 - Section A (Science)"
    },
    {
      id: "STF-104",
      name: "Rebecca Rivera",
      gender: "Female",
      designation: "English Literature Teacher",
      department: "English Literature",
      email: "rebecca.r@stxaviers-academy.edu",
      phone: "+1 (555) 304-1144",
      joiningDate: "2019-09-01",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      status: "Active",
      qualification: "M.A. English, TEFL",
      assignedClass: "Grade 9 - Section A"
    },
    {
      id: "STF-105",
      name: "Jonathan Vance",
      gender: "Male",
      designation: "History & Civics Teacher",
      department: "Social Studies & History",
      email: "jonathan.v@stxaviers-academy.edu",
      phone: "+1 (555) 305-2255",
      joiningDate: "2022-03-15",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      status: "Active",
      qualification: "M.A. World History",
      assignedClass: "Grade 8 - Section A"
    },
    {
      id: "STF-106",
      name: "Coach Tyler Brooks",
      gender: "Male",
      designation: "Athletic Director / PE",
      department: "Physical Education",
      email: "tyler.brooks@stxaviers-academy.edu",
      phone: "+1 (555) 306-7766",
      joiningDate: "2017-04-12",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      status: "Active",
      qualification: "B.P.Ed, Certified Fitness Trainer",
      assignedClass: "All Grades (Sports)"
    },
    {
      id: "STF-107",
      name: "Sarah Jenkins",
      gender: "Female",
      designation: "Senior Admin Officer",
      department: "Administration & Support",
      email: "sarah.j@stxaviers-academy.edu",
      phone: "+1 (555) 307-8877",
      joiningDate: "2016-11-20",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      status: "Active",
      qualification: "B.B.A. Public Relations",
      assignedClass: "Administration"
    },
    {
      id: "STF-108",
      name: "Emily Watson",
      gender: "Female",
      designation: "Arts & Visual Design Instructor",
      department: "Arts & Music",
      email: "emily.watson@stxaviers-academy.edu",
      phone: "+1 (555) 308-3388",
      joiningDate: "2021-08-01",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      status: "Active",
      qualification: "B.F.A. Fine Arts",
      assignedClass: "Grade 9 - Section B"
    },
    {
      id: "STF-109",
      name: "Gregory House",
      gender: "Male",
      designation: "Biology & Chemistry Specialist",
      department: "Science",
      email: "gregory.h@stxaviers-academy.edu",
      phone: "+1 (555) 309-4499",
      joiningDate: "2020-02-14",
      avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80",
      status: "Active",
      qualification: "M.Sc. Biochemistry",
      assignedClass: "Grade 11 - Section A (Science)"
    },
    {
      id: "STF-110",
      name: "Amara Patel",
      gender: "Female",
      designation: "Economics & Commerce Teacher",
      department: "Social Studies & History",
      email: "amara.patel@stxaviers-academy.edu",
      phone: "+1 (555) 310-5500",
      joiningDate: "2023-01-05",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      status: "Active",
      qualification: "M.Com, Chartered Financial Analyst",
      assignedClass: "Grade 12 - Section B (Commerce)"
    },
    {
      id: "STF-111",
      name: "Arthur Pendelton",
      gender: "Male",
      designation: "Principal / Academic Dean",
      department: "Administration & Support",
      email: "principal@stxaviers-academy.edu",
      phone: "+1 (555) 311-6611",
      joiningDate: "2012-05-10",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
      status: "Active",
      qualification: "Ph.D. Educational Leadership",
      assignedClass: "School Dean"
    },
    {
      id: "STF-112",
      name: "Maria Gonzalez",
      gender: "Female",
      designation: "School Nurse & Health Officer",
      department: "Administration & Support",
      email: "maria.nurse@stxaviers-academy.edu",
      phone: "+1 (555) 312-7722",
      joiningDate: "2019-10-01",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
      status: "Active",
      qualification: "B.S. Nursing, RN",
      assignedClass: "Health Clinic"
    }
  ],

  students: [
    // Grade 10 - Section A
    {
      id: "STD-1001",
      name: "Liam Alexander",
      gender: "Male",
      guardianName: "Robert Alexander",
      class: "Grade 10",
      section: "A",
      rollNumber: "10-01",
      phone: "+1 (555) 401-1101",
      email: "liam.a@student.edu",
      admissionDate: "2022-08-20",
      dob: "2009-04-12",
      address: "124 Elm Street, Springfield",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
      status: "Active"
    },
    {
      id: "STD-1002",
      name: "Emma Watson-Smith",
      gender: "Female",
      guardianName: "Daniel Smith",
      class: "Grade 10",
      section: "A",
      rollNumber: "10-02",
      phone: "+1 (555) 401-1102",
      email: "emma.ws@student.edu",
      admissionDate: "2022-08-20",
      dob: "2009-07-25",
      address: "450 Maple Avenue, Springfield",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      status: "Active"
    },
    {
      id: "STD-1003",
      name: "Noah Benjamin",
      gender: "Male",
      guardianName: "Thomas Benjamin",
      class: "Grade 10",
      section: "A",
      rollNumber: "10-03",
      phone: "+1 (555) 401-1103",
      email: "noah.b@student.edu",
      admissionDate: "2022-08-21",
      dob: "2009-02-18",
      address: "88 Pine Lane, Springfield",
      avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80",
      status: "Active"
    },
    {
      id: "STD-1004",
      name: "Sophia Martinez",
      gender: "Female",
      guardianName: "Carlos Martinez",
      class: "Grade 10",
      section: "A",
      rollNumber: "10-04",
      phone: "+1 (555) 401-1104",
      email: "sophia.m@student.edu",
      admissionDate: "2022-08-22",
      dob: "2009-11-03",
      address: "312 Cedar Blvd, Springfield",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      status: "Active"
    },
    {
      id: "STD-1005",
      name: "Ethan Wright",
      gender: "Male",
      guardianName: "James Wright",
      class: "Grade 10",
      section: "A",
      rollNumber: "10-05",
      phone: "+1 (555) 401-1105",
      email: "ethan.w@student.edu",
      admissionDate: "2022-08-22",
      dob: "2009-09-14",
      address: "719 Oak Terrace, Springfield",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
      status: "Active"
    },
    {
      id: "STD-1006",
      name: "Olivia Chen",
      gender: "Female",
      guardianName: "Wei Chen",
      class: "Grade 10",
      section: "A",
      rollNumber: "10-06",
      phone: "+1 (555) 401-1106",
      email: "olivia.c@student.edu",
      admissionDate: "2022-08-23",
      dob: "2009-05-30",
      address: "55 Blossom Hill, Springfield",
      avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
      status: "Active"
    },
    {
      id: "STD-1007",
      name: "Lucas Rivera",
      gender: "Male",
      guardianName: "Manuel Rivera",
      class: "Grade 10",
      section: "A",
      rollNumber: "10-07",
      phone: "+1 (555) 401-1107",
      email: "lucas.r@student.edu",
      admissionDate: "2022-08-25",
      dob: "2009-01-19",
      address: "103 Valley View, Springfield",
      avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
      status: "Active"
    },
    {
      id: "STD-1008",
      name: "Ava Johnson",
      gender: "Female",
      guardianName: "Samuel Johnson",
      class: "Grade 10",
      section: "A",
      rollNumber: "10-08",
      phone: "+1 (555) 401-1108",
      email: "ava.j@student.edu",
      admissionDate: "2022-08-25",
      dob: "2009-12-08",
      address: "920 Horizon Way, Springfield",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      status: "Active"
    },

    // Grade 10 - Section B
    {
      id: "STD-1009",
      name: "Mason Taylor",
      gender: "Male",
      guardianName: "Paul Taylor",
      class: "Grade 10",
      section: "B",
      rollNumber: "10-09",
      phone: "+1 (555) 402-1109",
      email: "mason.t@student.edu",
      admissionDate: "2022-08-20",
      dob: "2009-03-21",
      address: "630 Ridge Road, Springfield",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
      status: "Active"
    },
    {
      id: "STD-1010",
      name: "Isabella Davis",
      gender: "Female",
      guardianName: "Gregory Davis",
      class: "Grade 10",
      section: "B",
      rollNumber: "10-10",
      phone: "+1 (555) 402-1110",
      email: "isabella.d@student.edu",
      admissionDate: "2022-08-20",
      dob: "2009-08-16",
      address: "214 Sunset Blvd, Springfield",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      status: "Active"
    },
    {
      id: "STD-1011",
      name: "James Wilson",
      gender: "Male",
      guardianName: "Brian Wilson",
      class: "Grade 10",
      section: "B",
      rollNumber: "10-11",
      phone: "+1 (555) 402-1111",
      email: "james.w@student.edu",
      admissionDate: "2022-08-22",
      dob: "2009-10-05",
      address: "411 Magnolia Drive, Springfield",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      status: "Active"
    },
    {
      id: "STD-1012",
      name: "Mia Anderson",
      gender: "Female",
      guardianName: "Kenneth Anderson",
      class: "Grade 10",
      section: "B",
      rollNumber: "10-12",
      phone: "+1 (555) 402-1112",
      email: "mia.a@student.edu",
      admissionDate: "2022-08-23",
      dob: "2009-06-11",
      address: "830 Forest Park, Springfield",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      status: "Active"
    },

    // Grade 9 - Section A & B
    {
      id: "STD-1013",
      name: "Benjamin Scott",
      gender: "Male",
      guardianName: "Andrew Scott",
      class: "Grade 9",
      section: "A",
      rollNumber: "09-01",
      phone: "+1 (555) 403-1113",
      email: "ben.s@student.edu",
      admissionDate: "2023-08-18",
      dob: "2010-02-14",
      address: "710 Aspen Street, Springfield",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
      status: "Active"
    },
    {
      id: "STD-1014",
      name: "Charlotte Evans",
      gender: "Female",
      guardianName: "Victor Evans",
      class: "Grade 9",
      section: "A",
      rollNumber: "09-02",
      phone: "+1 (555) 403-1114",
      email: "charlotte.e@student.edu",
      admissionDate: "2023-08-18",
      dob: "2010-09-27",
      address: "344 Willow Lane, Springfield",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      status: "Active"
    },
    {
      id: "STD-1015",
      name: "Henry Moore",
      gender: "Male",
      guardianName: "Patrick Moore",
      class: "Grade 9",
      section: "B",
      rollNumber: "09-03",
      phone: "+1 (555) 403-1115",
      email: "henry.m@student.edu",
      admissionDate: "2023-08-19",
      dob: "2010-04-09",
      address: "188 Chestnut St, Springfield",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      status: "Active"
    },
    {
      id: "STD-1016",
      name: "Amelia King",
      gender: "Female",
      guardianName: "Steven King",
      class: "Grade 9",
      section: "B",
      rollNumber: "09-04",
      phone: "+1 (555) 403-1116",
      email: "amelia.k@student.edu",
      admissionDate: "2023-08-20",
      dob: "2010-11-15",
      address: "502 Birch Court, Springfield",
      avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
      status: "Active"
    },

    // Grade 8 - Section A & B
    {
      id: "STD-1017",
      name: "Alexander Hall",
      gender: "Male",
      guardianName: "Walter Hall",
      class: "Grade 8",
      section: "A",
      rollNumber: "08-01",
      phone: "+1 (555) 404-1117",
      email: "alex.h@student.edu",
      admissionDate: "2024-08-15",
      dob: "2011-03-03",
      address: "921 Cypress Ave, Springfield",
      avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80",
      status: "Active"
    },
    {
      id: "STD-1018",
      name: "Harper Lee-Green",
      gender: "Female",
      guardianName: "Nathan Green",
      class: "Grade 8",
      section: "A",
      rollNumber: "08-02",
      phone: "+1 (555) 404-1118",
      email: "harper.g@student.edu",
      admissionDate: "2024-08-15",
      dob: "2011-07-19",
      address: "614 Sycamore Drive, Springfield",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      status: "Active"
    },
    {
      id: "STD-1019",
      name: "Daniel Baker",
      gender: "Male",
      guardianName: "Carl Baker",
      class: "Grade 8",
      section: "B",
      rollNumber: "08-03",
      phone: "+1 (555) 404-1119",
      email: "daniel.b@student.edu",
      admissionDate: "2024-08-16",
      dob: "2011-12-01",
      address: "220 Laurel Way, Springfield",
      avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
      status: "Active"
    },
    {
      id: "STD-1020",
      name: "Evelyn Adams",
      gender: "Female",
      guardianName: "Dennis Adams",
      class: "Grade 8",
      section: "B",
      rollNumber: "08-04",
      phone: "+1 (555) 404-1120",
      email: "evelyn.a@student.edu",
      admissionDate: "2024-08-17",
      dob: "2011-05-24",
      address: "705 Poplar Street, Springfield",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      status: "Active"
    },

    // Grade 11 - Sections
    {
      id: "STD-1021",
      name: "Sebastian Cruz",
      gender: "Male",
      guardianName: "Felipe Cruz",
      class: "Grade 11",
      section: "A (Science)",
      rollNumber: "11-01",
      phone: "+1 (555) 405-1121",
      email: "sebastian.c@student.edu",
      admissionDate: "2021-08-20",
      dob: "2008-01-30",
      address: "419 Redwood Road, Springfield",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
      status: "Active"
    },
    {
      id: "STD-1022",
      name: "Grace Patel",
      gender: "Female",
      guardianName: "Rajesh Patel",
      class: "Grade 11",
      section: "A (Science)",
      rollNumber: "11-02",
      phone: "+1 (555) 405-1122",
      email: "grace.p@student.edu",
      admissionDate: "2021-08-20",
      dob: "2008-06-15",
      address: "882 Timberline St, Springfield",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      status: "Active"
    },
    {
      id: "STD-1023",
      name: "Jack Harrison",
      gender: "Male",
      guardianName: "Mark Harrison",
      class: "Grade 11",
      section: "B (Commerce)",
      rollNumber: "11-03",
      phone: "+1 (555) 405-1123",
      email: "jack.h@student.edu",
      admissionDate: "2021-08-22",
      dob: "2008-10-18",
      address: "155 Grand Avenue, Springfield",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
      status: "Active"
    },
    {
      id: "STD-1024",
      name: "Chloe Vance",
      gender: "Female",
      guardianName: "Arthur Vance",
      class: "Grade 11",
      section: "C (Arts)",
      rollNumber: "11-04",
      phone: "+1 (555) 405-1124",
      email: "chloe.v@student.edu",
      admissionDate: "2021-08-23",
      dob: "2008-08-04",
      address: "310 Meadow Lane, Springfield",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      status: "Active"
    },

    // Grade 12 - Sections
    {
      id: "STD-1025",
      name: "Matthew Turner",
      gender: "Male",
      guardianName: "Gary Turner",
      class: "Grade 12",
      section: "A (Science)",
      rollNumber: "12-01",
      phone: "+1 (555) 406-1125",
      email: "matthew.t@student.edu",
      admissionDate: "2020-08-25",
      dob: "2007-03-10",
      address: "940 Summit Drive, Springfield",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      status: "Active"
    },
    {
      id: "STD-1026",
      name: "Zoe Foster",
      gender: "Female",
      guardianName: "Craig Foster",
      class: "Grade 12",
      section: "A (Science)",
      rollNumber: "12-02",
      phone: "+1 (555) 406-1126",
      email: "zoe.f@student.edu",
      admissionDate: "2020-08-25",
      dob: "2007-11-20",
      address: "118 River Road, Springfield",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      status: "Active"
    },
    {
      id: "STD-1027",
      name: "Oliver Quinn",
      gender: "Male",
      guardianName: "Donald Quinn",
      class: "Grade 12",
      section: "B (Commerce)",
      rollNumber: "12-03",
      phone: "+1 (555) 406-1127",
      email: "oliver.q@student.edu",
      admissionDate: "2020-08-26",
      dob: "2007-09-02",
      address: "602 Hillcrest Park, Springfield",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      status: "Active"
    },
    {
      id: "STD-1028",
      name: "Lily Montgomery",
      gender: "Female",
      guardianName: "Jonathan Montgomery",
      class: "Grade 12",
      section: "C (Arts)",
      rollNumber: "12-04",
      phone: "+1 (555) 406-1128",
      email: "lily.m@student.edu",
      admissionDate: "2020-08-27",
      dob: "2007-05-14",
      address: "777 Highland Crest, Springfield",
      avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
      status: "Active"
    }
  ],

  leaves: [
    {
      id: "LEV-501",
      personType: "student",
      personId: "STD-1003",
      personName: "Noah Benjamin",
      contextInfo: "Grade 10 - Section A",
      leaveType: "Medical / Sick Leave",
      startDate: "2026-09-02",
      endDate: "2026-09-04",
      days: 3,
      reason: "Severe viral fever and doctor recommended bed rest.",
      status: "Approved",
      appliedOn: "2026-09-01",
      reviewedBy: "Prof. Marcus Thorne",
      reviewedOn: "2026-09-01"
    },
    {
      id: "LEV-502",
      personType: "staff",
      personId: "STF-105",
      personName: "Jonathan Vance",
      contextInfo: "Social Studies & History",
      leaveType: "Casual / Personal Leave",
      startDate: "2026-09-03",
      endDate: "2026-09-03",
      days: 1,
      reason: "Attending annual regional history conference.",
      status: "Approved",
      appliedOn: "2026-08-30",
      reviewedBy: "Dr. Eleanor Vance",
      reviewedOn: "2026-08-31"
    },
    {
      id: "LEV-503",
      personType: "student",
      personId: "STD-1011",
      personName: "James Wilson",
      contextInfo: "Grade 10 - Section B",
      leaveType: "Academic / Sports Event",
      startDate: "2026-09-04",
      endDate: "2026-09-05",
      days: 2,
      reason: "Selected for State Inter-School Tennis Championship tournament.",
      status: "Pending",
      appliedOn: "2026-09-02",
      reviewedBy: null,
      reviewedOn: null
    },
    {
      id: "LEV-504",
      personType: "staff",
      personId: "STF-109",
      personName: "Gregory House",
      contextInfo: "Science",
      leaveType: "Medical / Sick Leave",
      startDate: "2026-09-03",
      endDate: "2026-09-05",
      days: 3,
      reason: "Undergoing routine outpatient orthopedic procedure.",
      status: "Pending",
      appliedOn: "2026-09-02",
      reviewedBy: null,
      reviewedOn: null
    },
    {
      id: "LEV-505",
      personType: "student",
      personId: "STD-1024",
      personName: "Chloe Vance",
      contextInfo: "Grade 11 - Section C (Arts)",
      leaveType: "Family Emergency",
      startDate: "2026-08-28",
      endDate: "2026-08-29",
      days: 2,
      reason: "Attending urgent family bereavement out of state.",
      status: "Approved",
      appliedOn: "2026-08-27",
      reviewedBy: "Dr. Eleanor Vance",
      reviewedOn: "2026-08-27"
    },
    {
      id: "LEV-506",
      personType: "student",
      personId: "STD-1007",
      personName: "Lucas Rivera",
      contextInfo: "Grade 10 - Section A",
      leaveType: "Casual / Personal Leave",
      startDate: "2026-08-25",
      endDate: "2026-08-25",
      days: 1,
      reason: "Family trip during school term without prior notice.",
      status: "Rejected",
      appliedOn: "2026-08-24",
      reviewedBy: "Prof. Marcus Thorne",
      reviewedOn: "2026-08-24",
      rejectionReason: "Unplanned leaves during test week are not permitted."
    }
  ],

  notifications: [
    {
      id: "NTF-801",
      title: "New Leave Application",
      message: "James Wilson (Grade 10-B) requested 2 days Sports Leave starting Sept 4.",
      type: "leave",
      timestamp: "2026-09-02T14:30:00",
      read: false,
      link: "leaves"
    },
    {
      id: "NTF-802",
      title: "Staff Leave Request",
      message: "Gregory House (Science Dept) requested 3 days Medical Leave starting Sept 3.",
      type: "leave",
      timestamp: "2026-09-02T16:15:00",
      read: false,
      link: "leaves"
    },
    {
      id: "NTF-803",
      title: "Low Attendance Alert",
      message: "Lucas Rivera (Grade 10-A) attendance has dropped to 73.5% (Threshold: 75%).",
      type: "alert",
      timestamp: "2026-09-02T18:00:00",
      read: false,
      link: "students"
    },
    {
      id: "NTF-804",
      title: "Daily Attendance Reminder",
      message: "Grade 8 Section B daily student attendance has been marked by Class Teacher.",
      type: "info",
      timestamp: "2026-09-03T09:10:00",
      read: true,
      link: "student-attendance"
    }
  ]
};

/**
 * Helper to generate 30 days of past realistic attendance records
 * for both students and staff.
 */
function generateHistoricalAttendance(students, staff) {
  const studentAttendance = [];
  const staffAttendance = [];
  
  // Date range: 25 weekdays leading up to today (2026-09-03)
  const dates = [];
  const baseDate = new Date(2026, 8, 3); // 2026-09-03
  
  for (let i = 28; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() - i);
    const dayOfWeek = d.getDay();
    // Skip weekends (0 = Sun, 6 = Sat)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      dates.push(`${yyyy}-${mm}-${dd}`);
    }
  }

  // Generate Student Attendance Records
  dates.forEach((dateStr, dIdx) => {
    const isToday = (dateStr === "2026-09-03");

    students.forEach((student, sIdx) => {
      let status = "Present";
      let remarks = "";

      // Deterministic realistic behavior based on student & date
      if (student.id === "STD-1003" && ["2026-09-02", "2026-09-03", "2026-09-04"].includes(dateStr)) {
        status = "Leave";
        remarks = "Approved Medical Leave";
      } else if (student.id === "STD-1007" && (dIdx % 4 === 1)) {
        status = "Absent";
        remarks = "Uninformed Absence";
      } else if ((sIdx + dIdx) % 19 === 0) {
        status = "Late";
        remarks = "Late by 10 mins (Bus delay)";
      } else if ((sIdx + dIdx) % 29 === 0 && !isToday) {
        status = "Absent";
        remarks = "Personal Reason";
      } else if (isToday && student.id === "STD-1005") {
        status = "Absent";
        remarks = "Parent informed via phone";
      } else if (isToday && student.id === "STD-1015") {
        status = "Late";
        remarks = "Traffic congestion";
      }

      studentAttendance.push({
        id: `ATT-STD-${dateStr}-${student.id}`,
        studentId: student.id,
        studentName: student.name,
        rollNumber: student.rollNumber,
        class: student.class,
        section: student.section,
        date: dateStr,
        status: status, // Present | Absent | Late | Leave
        remarks: remarks,
        markedAt: `${dateStr}T08:35:00`,
        markedBy: "Prof. Marcus Thorne"
      });
    });

    // Generate Staff Attendance Records
    staff.forEach((member, mIdx) => {
      let status = "Present";
      let remarks = "";

      if (member.id === "STF-105" && dateStr === "2026-09-03") {
        status = "Leave";
        remarks = "History Conference Leave";
      } else if (member.id === "STF-109" && dateStr === "2026-09-03") {
        status = "Leave";
        remarks = "Medical Procedure";
      } else if ((mIdx + dIdx) % 23 === 0 && !isToday) {
        status = "Absent";
        remarks = "Approved Duty Travel";
      } else if ((mIdx + dIdx) % 17 === 0) {
        status = "Late";
        remarks = "Arrived at 08:45 AM";
      }

      staffAttendance.push({
        id: `ATT-STF-${dateStr}-${member.id}`,
        staffId: member.id,
        staffName: member.name,
        department: member.department,
        designation: member.designation,
        date: dateStr,
        status: status, // Present | Absent | Late | Leave
        remarks: remarks,
        markedAt: `${dateStr}T08:15:00`,
        markedBy: "Dr. Eleanor Vance"
      });
    });
  });

  return { studentAttendance, staffAttendance };
}

// Attach generated attendance history
const historicalData = generateHistoricalAttendance(SEED_DATA.students, SEED_DATA.staff);
SEED_DATA.studentAttendance = historicalData.studentAttendance;
SEED_DATA.staffAttendance = historicalData.staffAttendance;
