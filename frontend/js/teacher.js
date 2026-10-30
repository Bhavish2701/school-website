/**
 * Sri Vidya E.M High School - Dedicated Teacher Portal
 * Faculty: Ms. Anjali (Class Teacher – Grade 8A, Mathematics)
 */

var teacherApp = (function () {
  'use strict';

  // Application State
  const state = {
    activeModule: 'dashboard',
    activeSubTab: {
      'my-classes': 'classes',
      'attendance': 'mark',
      'academics': 'plans',
      'assignments': 'create',
      'examinations': 'schedule',
      'timetable': 'my',
      'communication': 'class-announcements',
      'leave': 'apply',
      'profile': 'personal'
    },
    teacher: {
      name: 'Ms. Anjali',
      role: 'Class Teacher – Grade 8A',
      subject: 'Mathematics',
      totalClasses: 4,
      totalStudents: 152,
      todayAttendancePct: '96%'
    },
    classes: [
      { id: '8a', code: '8A', name: 'Class 8A', isClassTeacher: true, roleTitle: 'Class Teacher & Subject Faculty', subject: 'Mathematics', strength: 42, room: 'Room 204 (2nd Floor, Main Block)', timing: 'Period 1 (08:45 AM - 09:30 AM)', avgScore: '86.4%', topper: 'V. Divya Bharathi (49/50)' },
      { id: '9b', code: '9B', name: 'Class 9B', isClassTeacher: false, roleTitle: 'Subject Teacher', subject: 'Mathematics', strength: 40, room: 'Room 208 (2nd Floor, High School Wing)', timing: 'Period 3 (10:45 AM - 11:30 AM)', avgScore: '82.1%', topper: 'P. Lavanya (48/50)' },
      { id: '7c', code: '7C', name: 'Class 7C', isClassTeacher: false, roleTitle: 'Subject Teacher', subject: 'Mathematics', strength: 38, room: 'Room 112 (1st Floor, Middle Wing)', timing: 'Period 5 (01:15 PM - 02:00 PM)', avgScore: '89.0%', topper: 'S. Bhavana (48/50)' },
      { id: '10a', code: '10A', name: 'Class 10A', isClassTeacher: false, roleTitle: 'Remedial Faculty', subject: 'Mathematics (Remedial & Board Exam Prep)', strength: 32, room: 'Mathematics Lab 2 (Ground Floor)', timing: 'Period 7 (03:00 PM - 03:45 PM)', avgScore: '78.5%', topper: 'K. Sai Tharun (45/50)' }
    ],
    pendingTasks: [
      { id: 1, title: 'Evaluate Class 8A Math Unit Test 2 Answer Sheets', meta: 'Due Today (05:00 PM) • 42 Papers', badge: 'due-today', badgeText: 'Due Today', done: false },
      { id: 2, title: 'Confirm & submit morning attendance register for Grade 8A', meta: 'Due Today (10:00 AM) • Daily Office Submission', badge: 'due-today', badgeText: 'Due Today', done: false },
      { id: 3, title: 'Reply to Mr. Rambabu regarding Karthik’s geometry notebook', meta: 'Parent Message • Inward #842', badge: 'due-soon', badgeText: 'Pending Reply', done: false },
      { id: 4, title: 'Upload Chapter 3 polynomials study notes PDF', meta: 'Class 9B • Academic Repository', badge: 'due-soon', badgeText: 'Due Tomorrow', done: false },
      { id: 5, title: 'Prepare remedial practice worksheets for 3 students', meta: 'Class 8A (Naveen, Teja, Keerthi)', badge: 'due-soon', badgeText: 'This Week', done: false },
      { id: 6, title: 'Submit quarterly examination question paper to Vice Principal', meta: 'Vice Principal Submission • Deadline Sept 21', badge: 'due-soon', badgeText: 'Sept 21', done: false },
      { id: 7, title: 'Verify math club project submissions for Science & Math fair', meta: 'Co-Curricular Review • 6 Teams', badge: 'due-soon', badgeText: 'This Week', done: false },
      { id: 8, title: 'Sign student diaries for assembly dress code notice', meta: 'Class 8A Class Teacher Period', badge: 'due-soon', badgeText: 'Pending', done: false }
    ],
    // Complete Roster: Class 8A (Roll 801 to 842 = exactly 42 students), Class 9B, Class 7C
    students: [
      // Class 8A (Exactly 42 Students)
      { roll: 801, name: 'A. Naveen Kumar', class: '8A', phone: '9848123001', att: 'P', marks: 38, remarks: 'Good improvement in linear equations' },
      { roll: 802, name: 'B. Sravan Reddy', class: '8A', phone: '9848123002', att: 'P', marks: 44, remarks: 'Excellent algebra understanding' },
      { roll: 803, name: 'CH. Swathi', class: '8A', phone: '9848123003', att: 'P', marks: 47, remarks: 'Subject topper potential' },
      { roll: 804, name: 'V. Divya Bharathi', class: '8A', phone: '9848678901', att: 'P', marks: 49, remarks: 'Class Rank 1 - Highest marks in test' },
      { roll: 805, name: 'D. Manoj Kumar', class: '8A', phone: '9848123005', att: 'P', marks: 36, remarks: 'Needs extra drill on word problems' },
      { roll: 806, name: 'G. Harika', class: '8A', phone: '9848123006', att: 'P', marks: 42, remarks: 'Active classroom participation' },
      { roll: 807, name: 'K. Sai Krishna', class: '8A', phone: '9848123007', att: 'A', marks: 34, remarks: 'Absent today (Medical note submitted)' },
      { roll: 808, name: 'M. Tejaswi', class: '8A', phone: '9848123008', att: 'P', marks: 45, remarks: 'Very thorough solutions in geometry' },
      { roll: 809, name: 'P. Charan', class: '8A', phone: '9848123009', att: 'P', marks: 40, remarks: 'Steady homework submissions' },
      { roll: 810, name: 'R. Ananya', class: '8A', phone: '9848123010', att: 'P', marks: 48, remarks: 'Outstanding analytical skills' },
      { roll: 811, name: 'S. Akhil', class: '8A', phone: '9848123011', att: 'P', marks: 39, remarks: 'Punctual and disciplined' },
      { roll: 812, name: 'T. Bhavani', class: '8A', phone: '9848123012', att: 'P', marks: 46, remarks: 'Neat notebook presentation' },
      { roll: 813, name: 'V. Chandra Sekhar', class: '8A', phone: '9848123013', att: 'P', marks: 41, remarks: 'Good geometry skills' },
      { roll: 814, name: 'Y. Deepthi', class: '8A', phone: '9848123014', att: 'P', marks: 43, remarks: 'Very attentive in math sessions' },
      { roll: 815, name: 'A. Ganesh', class: '8A', phone: '9848123015', att: 'P', marks: 37, remarks: 'Practicing fraction operations' },
      { roll: 816, name: 'B. Hemalatha', class: '8A', phone: '9848123016', att: 'P', marks: 44, remarks: 'High arithmetic precision' },
      { roll: 817, name: 'C. Indu', class: '8A', phone: '9848123017', att: 'P', marks: 42, remarks: 'Consistent academic performance' },
      { roll: 818, name: 'D. Jagadeesh', class: '8A', phone: '9848123018', att: 'P', marks: 35, remarks: 'Attending remedial clinic' },
      { roll: 819, name: 'E. Kavya', class: '8A', phone: '9848123019', att: 'P', marks: 46, remarks: 'Fast mental math calculations' },
      { roll: 820, name: 'G. Lokesh', class: '8A', phone: '9848123020', att: 'P', marks: 38, remarks: 'Good classroom response' },
      { roll: 821, name: 'K. Madhavi', class: '8A', phone: '9848123021', att: 'P', marks: 47, remarks: 'Excellent score in polynomials' },
      { roll: 822, name: 'M. Nagesh', class: '8A', phone: '9848123022', att: 'P', marks: 40, remarks: 'Regular and attentive' },
      { roll: 823, name: 'N. Ooha', class: '8A', phone: '9848123023', att: 'P', marks: 45, remarks: 'Strong mathematical logic' },
      { roll: 824, name: 'P. Pawan Kalyan', class: '8A', phone: '9848123024', att: 'P', marks: 41, remarks: 'Well maintained math record' },
      { roll: 825, name: 'R. Rajesh', class: '8A', phone: '9848123025', att: 'P', marks: 36, remarks: 'Showing steady progress' },
      { roll: 826, name: 'S. Sai Ram', class: '8A', phone: '9848123026', att: 'P', marks: 44, remarks: 'Very good grasp of formulas' },
      { roll: 827, name: 'T. Tarun Kumar', class: '8A', phone: '9848123027', att: 'P', marks: 39, remarks: 'Active in group problem solving' },
      { roll: 828, name: 'U. Usha Rani', class: '8A', phone: '9848123028', att: 'P', marks: 43, remarks: 'Consistently completes exercises' },
      { roll: 829, name: 'V. Venkat', class: '8A', phone: '9848123029', att: 'P', marks: 42, remarks: 'Good focus in class' },
      { roll: 830, name: 'Y. Yamini', class: '8A', phone: '9848123030', att: 'P', marks: 48, remarks: 'Top 3 ranker in Grade 8A' },
      { roll: 831, name: 'B. Ajay', class: '8A', phone: '9848123031', att: 'P', marks: 37, remarks: 'Improving in quadratic equations' },
      { roll: 832, name: 'C. Bindu', class: '8A', phone: '9848123032', att: 'P', marks: 45, remarks: 'Clear step-by-step reasoning' },
      { roll: 833, name: 'D. Chaitanya', class: '8A', phone: '9848123033', att: 'P', marks: 41, remarks: 'Good teamwork in math lab' },
      { roll: 834, name: 'G. Dinesh', class: '8A', phone: '9848123034', att: 'P', marks: 38, remarks: 'Good attendance and punctuality' },
      { roll: 835, name: 'K. Eshwar', class: '8A', phone: '9848123035', att: 'P', marks: 46, remarks: 'High accuracy in calculations' },
      { roll: 836, name: 'M. Fathima', class: '8A', phone: '9848123036', att: 'P', marks: 47, remarks: 'Distinction level test score' },
      { roll: 837, name: 'P. Gowtham', class: '8A', phone: '9848123037', att: 'P', marks: 40, remarks: 'Regular notebook submission' },
      { roll: 838, name: 'R. Hemanth', class: '8A', phone: '9848123038', att: 'P', marks: 39, remarks: 'Solid effort in homework' },
      { roll: 839, name: 'S. Ishwarya', class: '8A', phone: '9848123039', att: 'P', marks: 44, remarks: 'Good analytical thinking' },
      { roll: 840, name: 'T. Jyothi', class: '8A', phone: '9848123040', att: 'P', marks: 43, remarks: 'Clear handwriting and diagrams' },
      { roll: 841, name: 'CH. Karthik', class: '8A', phone: '9848789012', att: 'L', marks: 39, remarks: 'Arrived late today (Gate pass #44)' },
      { roll: 842, name: 'Y. Tharun', class: '8A', phone: '9848123012', att: 'A', marks: 32, remarks: 'Absent today (Uninformed - SMS sent)' },

      // Class 9B (Exactly 40 Students)
      {"roll":901,"name":"G. Sai Teja","class":"9B","phone":"9848450901","att":"P","marks":34,"remarks":"Strong fundamentals in polynomials and algebra"},
      {"roll":902,"name":"M. Sravanthi","class":"9B","phone":"9848450902","att":"P","marks":41,"remarks":"Polite, attentive and regular in homework"},
      {"roll":903,"name":"K. Rakesh","class":"9B","phone":"9848450903","att":"P","marks":48,"remarks":"High accuracy in coordinate geometry calculations"},
      {"roll":904,"name":"P. Lavanya","class":"9B","phone":"9848450904","att":"P","marks":39,"remarks":"Active participation in math group discussions"},
      {"roll":905,"name":"S. Varun","class":"9B","phone":"9848450905","att":"P","marks":46,"remarks":"Very good problem-solving speed and step clarity"},
      {"roll":906,"name":"B. Haritha","class":"9B","phone":"9848450906","att":"P","marks":37,"remarks":"Shows dedication and punctuality in daily work"},
      {"roll":907,"name":"N. Sandeep","class":"9B","phone":"9848450907","att":"A","marks":44,"remarks":"Strong fundamentals in polynomials and algebra"},
      {"roll":908,"name":"T. Manasa","class":"9B","phone":"9848450908","att":"P","marks":35,"remarks":"Polite, attentive and regular in homework"},
      {"roll":909,"name":"V. Naresh","class":"9B","phone":"9848450909","att":"P","marks":42,"remarks":"High accuracy in coordinate geometry calculations"},
      {"roll":910,"name":"J. Priyanka","class":"9B","phone":"9848450910","att":"P","marks":49,"remarks":"Active participation in math group discussions"},
      {"roll":911,"name":"R. Ajay Kumar","class":"9B","phone":"9848450911","att":"P","marks":40,"remarks":"Very good problem-solving speed and step clarity"},
      {"roll":912,"name":"D. Keerthi","class":"9B","phone":"9848450912","att":"P","marks":47,"remarks":"Shows dedication and punctuality in daily work"},
      {"roll":913,"name":"A. Sai Kiran","class":"9B","phone":"9848450913","att":"P","marks":38,"remarks":"Strong fundamentals in polynomials and algebra"},
      {"roll":914,"name":"C. Meghana","class":"9B","phone":"9848450914","att":"P","marks":45,"remarks":"Polite, attentive and regular in homework"},
      {"roll":915,"name":"E. Rohith","class":"9B","phone":"9848450915","att":"L","marks":36,"remarks":"High accuracy in coordinate geometry calculations"},
      {"roll":916,"name":"G. Pavani","class":"9B","phone":"9848450916","att":"P","marks":43,"remarks":"Active participation in math group discussions"},
      {"roll":917,"name":"H. Yashwanth","class":"9B","phone":"9848450917","att":"P","marks":34,"remarks":"Very good problem-solving speed and step clarity"},
      {"roll":918,"name":"K. Divya","class":"9B","phone":"9848450918","att":"P","marks":41,"remarks":"Shows dedication and punctuality in daily work"},
      {"roll":919,"name":"L. Pradeep","class":"9B","phone":"9848450919","att":"P","marks":48,"remarks":"Strong fundamentals in polynomials and algebra"},
      {"roll":920,"name":"M. Sneha","class":"9B","phone":"9848450920","att":"P","marks":39,"remarks":"Polite, attentive and regular in homework"},
      {"roll":921,"name":"N. Vinay","class":"9B","phone":"9848450921","att":"P","marks":46,"remarks":"High accuracy in coordinate geometry calculations"},
      {"roll":922,"name":"P. Anusha","class":"9B","phone":"9848450922","att":"P","marks":37,"remarks":"Active participation in math group discussions"},
      {"roll":923,"name":"R. Karthikeya","class":"9B","phone":"9848450923","att":"P","marks":44,"remarks":"Very good problem-solving speed and step clarity"},
      {"roll":924,"name":"S. Sushma","class":"9B","phone":"9848450924","att":"A","marks":35,"remarks":"Shows dedication and punctuality in daily work"},
      {"roll":925,"name":"T. Abhinav","class":"9B","phone":"9848450925","att":"P","marks":42,"remarks":"Strong fundamentals in polynomials and algebra"},
      {"roll":926,"name":"V. Pranitha","class":"9B","phone":"9848450926","att":"P","marks":49,"remarks":"Polite, attentive and regular in homework"},
      {"roll":927,"name":"Y. Bharath","class":"9B","phone":"9848450927","att":"P","marks":40,"remarks":"High accuracy in coordinate geometry calculations"},
      {"roll":928,"name":"A. Deepa","class":"9B","phone":"9848450928","att":"P","marks":47,"remarks":"Active participation in math group discussions"},
      {"roll":929,"name":"B. Harish","class":"9B","phone":"9848450929","att":"P","marks":38,"remarks":"Very good problem-solving speed and step clarity"},
      {"roll":930,"name":"C. Jyothika","class":"9B","phone":"9848450930","att":"P","marks":45,"remarks":"Shows dedication and punctuality in daily work"},
      {"roll":931,"name":"D. Kalyan","class":"9B","phone":"9848450931","att":"P","marks":36,"remarks":"Strong fundamentals in polynomials and algebra"},
      {"roll":932,"name":"G. Likitha","class":"9B","phone":"9848450932","att":"P","marks":43,"remarks":"Polite, attentive and regular in homework"},
      {"roll":933,"name":"K. Manoj","class":"9B","phone":"9848450933","att":"P","marks":34,"remarks":"High accuracy in coordinate geometry calculations"},
      {"roll":934,"name":"M. Nandini","class":"9B","phone":"9848450934","att":"P","marks":41,"remarks":"Active participation in math group discussions"},
      {"roll":935,"name":"P. Rahul","class":"9B","phone":"9848450935","att":"P","marks":48,"remarks":"Very good problem-solving speed and step clarity"},
      {"roll":936,"name":"R. Sahithi","class":"9B","phone":"9848450936","att":"P","marks":39,"remarks":"Shows dedication and punctuality in daily work"},
      {"roll":937,"name":"S. Tarun","class":"9B","phone":"9848450937","att":"P","marks":46,"remarks":"Strong fundamentals in polynomials and algebra"},
      {"roll":938,"name":"T. Varshini","class":"9B","phone":"9848450938","att":"P","marks":37,"remarks":"Polite, attentive and regular in homework"},
      {"roll":939,"name":"V. Vamsi","class":"9B","phone":"9848450939","att":"P","marks":44,"remarks":"High accuracy in coordinate geometry calculations"},
      {"roll":940,"name":"Y. Alekhya","class":"9B","phone":"9848450940","att":"P","marks":35,"remarks":"Active participation in math group discussions"},

      // Class 7C (Exactly 38 Students)
      {"roll":701,"name":"S. Bhavana","class":"7C","phone":"9848890701","att":"P","marks":36,"remarks":"High accuracy in fractions and decimal arithmetic"},
      {"roll":702,"name":"M. Rohit","class":"7C","phone":"9848890702","att":"P","marks":41,"remarks":"Excellent homework notebook and neat handwriting"},
      {"roll":703,"name":"A. Pranathi","class":"7C","phone":"9848890703","att":"P","marks":46,"remarks":"Quick mental math and active classroom response"},
      {"roll":704,"name":"B. Sumanth","class":"7C","phone":"9848890704","att":"P","marks":37,"remarks":"Showing steady improvement in geometry theorems"},
      {"roll":705,"name":"C. Tanuja","class":"7C","phone":"9848890705","att":"A","marks":42,"remarks":"Very well behaved and disciplined student"},
      {"roll":706,"name":"D. Charan Teja","class":"7C","phone":"9848890706","att":"P","marks":47,"remarks":"Good focus and prompt submission of assignments"},
      {"roll":707,"name":"E. Gayathri","class":"7C","phone":"9848890707","att":"P","marks":38,"remarks":"High accuracy in fractions and decimal arithmetic"},
      {"roll":708,"name":"G. Hemanth","class":"7C","phone":"9848890708","att":"P","marks":43,"remarks":"Excellent homework notebook and neat handwriting"},
      {"roll":709,"name":"K. Ishwarya","class":"7C","phone":"9848890709","att":"P","marks":48,"remarks":"Quick mental math and active classroom response"},
      {"roll":710,"name":"L. Jagadeesh","class":"7C","phone":"9848890710","att":"P","marks":39,"remarks":"Showing steady improvement in geometry theorems"},
      {"roll":711,"name":"M. Keerthana","class":"7C","phone":"9848890711","att":"P","marks":44,"remarks":"Very well behaved and disciplined student"},
      {"roll":712,"name":"N. Lohith","class":"7C","phone":"9848890712","att":"L","marks":49,"remarks":"Good focus and prompt submission of assignments"},
      {"roll":713,"name":"P. Moulya","class":"7C","phone":"9848890713","att":"P","marks":40,"remarks":"High accuracy in fractions and decimal arithmetic"},
      {"roll":714,"name":"R. Niharika","class":"7C","phone":"9848890714","att":"P","marks":45,"remarks":"Excellent homework notebook and neat handwriting"},
      {"roll":715,"name":"S. Omprakash","class":"7C","phone":"9848890715","att":"P","marks":36,"remarks":"Quick mental math and active classroom response"},
      {"roll":716,"name":"T. Pallavi","class":"7C","phone":"9848890716","att":"P","marks":41,"remarks":"Showing steady improvement in geometry theorems"},
      {"roll":717,"name":"V. Rajesh","class":"7C","phone":"9848890717","att":"P","marks":46,"remarks":"Very well behaved and disciplined student"},
      {"roll":718,"name":"Y. Sahiti","class":"7C","phone":"9848890718","att":"P","marks":37,"remarks":"Good focus and prompt submission of assignments"},
      {"roll":719,"name":"A. Tejas","class":"7C","phone":"9848890719","att":"P","marks":42,"remarks":"High accuracy in fractions and decimal arithmetic"},
      {"roll":720,"name":"B. Usha","class":"7C","phone":"9848890720","att":"P","marks":47,"remarks":"Excellent homework notebook and neat handwriting"},
      {"roll":721,"name":"C. Vikas","class":"7C","phone":"9848890721","att":"A","marks":38,"remarks":"Quick mental math and active classroom response"},
      {"roll":722,"name":"D. Yamini","class":"7C","phone":"9848890722","att":"P","marks":43,"remarks":"Showing steady improvement in geometry theorems"},
      {"roll":723,"name":"G. Akhila","class":"7C","phone":"9848890723","att":"P","marks":48,"remarks":"Very well behaved and disciplined student"},
      {"roll":724,"name":"H. Balaji","class":"7C","phone":"9848890724","att":"P","marks":39,"remarks":"Good focus and prompt submission of assignments"},
      {"roll":725,"name":"K. Chaitra","class":"7C","phone":"9848890725","att":"P","marks":44,"remarks":"High accuracy in fractions and decimal arithmetic"},
      {"roll":726,"name":"M. Deepak","class":"7C","phone":"9848890726","att":"P","marks":49,"remarks":"Excellent homework notebook and neat handwriting"},
      {"roll":727,"name":"N. Eswari","class":"7C","phone":"9848890727","att":"P","marks":40,"remarks":"Quick mental math and active classroom response"},
      {"roll":728,"name":"P. Farooq","class":"7C","phone":"9848890728","att":"P","marks":45,"remarks":"Showing steady improvement in geometry theorems"},
      {"roll":729,"name":"R. Geetha","class":"7C","phone":"9848890729","att":"P","marks":36,"remarks":"Very well behaved and disciplined student"},
      {"roll":730,"name":"S. Harsha","class":"7C","phone":"9848890730","att":"P","marks":41,"remarks":"Good focus and prompt submission of assignments"},
      {"roll":731,"name":"T. Indrani","class":"7C","phone":"9848890731","att":"P","marks":46,"remarks":"High accuracy in fractions and decimal arithmetic"},
      {"roll":732,"name":"V. Jayanth","class":"7C","phone":"9848890732","att":"P","marks":37,"remarks":"Excellent homework notebook and neat handwriting"},
      {"roll":733,"name":"Y. Kushal","class":"7C","phone":"9848890733","att":"P","marks":42,"remarks":"Quick mental math and active classroom response"},
      {"roll":734,"name":"A. Lavanya","class":"7C","phone":"9848890734","att":"P","marks":47,"remarks":"Showing steady improvement in geometry theorems"},
      {"roll":735,"name":"B. Mahesh","class":"7C","phone":"9848890735","att":"P","marks":38,"remarks":"Very well behaved and disciplined student"},
      {"roll":736,"name":"C. Navya","class":"7C","phone":"9848890736","att":"P","marks":43,"remarks":"Good focus and prompt submission of assignments"},
      {"roll":737,"name":"D. Pavan","class":"7C","phone":"9848890737","att":"P","marks":48,"remarks":"High accuracy in fractions and decimal arithmetic"},
      {"roll":738,"name":"G. Rupa","class":"7C","phone":"9848890738","att":"P","marks":39,"remarks":"Excellent homework notebook and neat handwriting"},

      // Class 10A Remedial (Exactly 32 Students)
      {"roll":1001,"name":"K. Sai Tharun","class":"10A","phone":"9848911001","att":"P","marks":32,"remarks":"Remedial focus: Practicing quadratic equations & trigonometry"},
      {"roll":1002,"name":"B. Vennela","class":"10A","phone":"9848911002","att":"P","marks":41,"remarks":"Board exam preparation: Improving step-by-step problem writing"},
      {"roll":1003,"name":"M. Dinesh Kumar","class":"10A","phone":"9848911003","att":"A","marks":33,"remarks":"Great commitment shown in afternoon remedial sessions"},
      {"roll":1004,"name":"V. Aditya","class":"10A","phone":"9848911004","att":"P","marks":42,"remarks":"Clarifies doubts regularly, formula retention is improving"},
      {"roll":1005,"name":"P. Hema Latha","class":"10A","phone":"9848911005","att":"P","marks":34,"remarks":"Steady progress in weekly remedial math drills"},
      {"roll":1006,"name":"T. Siri Varshini","class":"10A","phone":"9848911006","att":"P","marks":43,"remarks":"Very responsive to one-on-one coaching and practice papers"},
      {"roll":1007,"name":"G. Sai Teja","class":"10A","phone":"9848911007","att":"P","marks":35,"remarks":"Remedial focus: Practicing quadratic equations & trigonometry"},
      {"roll":1008,"name":"K. Tanvi Sree","class":"10A","phone":"9848911008","att":"P","marks":44,"remarks":"Board exam preparation: Improving step-by-step problem writing"},
      {"roll":1009,"name":"S. Bhavana","class":"10A","phone":"9848911009","att":"P","marks":36,"remarks":"Great commitment shown in afternoon remedial sessions"},
      {"roll":1010,"name":"M. Sravanthi","class":"10A","phone":"9848911010","att":"L","marks":45,"remarks":"Clarifies doubts regularly, formula retention is improving"},
      {"roll":1011,"name":"A. Naveen","class":"10A","phone":"9848911011","att":"P","marks":37,"remarks":"Steady progress in weekly remedial math drills"},
      {"roll":1012,"name":"CH. Rithwik","class":"10A","phone":"9848911012","att":"P","marks":46,"remarks":"Very responsive to one-on-one coaching and practice papers"},
      {"roll":1013,"name":"D. Sai Charan","class":"10A","phone":"9848911013","att":"P","marks":38,"remarks":"Remedial focus: Practicing quadratic equations & trigonometry"},
      {"roll":1014,"name":"G. Swetha","class":"10A","phone":"9848911014","att":"P","marks":47,"remarks":"Board exam preparation: Improving step-by-step problem writing"},
      {"roll":1015,"name":"K. Bharat","class":"10A","phone":"9848911015","att":"P","marks":39,"remarks":"Great commitment shown in afternoon remedial sessions"},
      {"roll":1016,"name":"M. Harish","class":"10A","phone":"9848911016","att":"P","marks":48,"remarks":"Clarifies doubts regularly, formula retention is improving"},
      {"roll":1017,"name":"N. Pooja","class":"10A","phone":"9848911017","att":"P","marks":40,"remarks":"Steady progress in weekly remedial math drills"},
      {"roll":1018,"name":"P. Srikanth","class":"10A","phone":"9848911018","att":"P","marks":32,"remarks":"Very responsive to one-on-one coaching and practice papers"},
      {"roll":1019,"name":"R. Madhuri","class":"10A","phone":"9848911019","att":"A","marks":41,"remarks":"Remedial focus: Practicing quadratic equations & trigonometry"},
      {"roll":1020,"name":"S. Vishnu","class":"10A","phone":"9848911020","att":"P","marks":33,"remarks":"Board exam preparation: Improving step-by-step problem writing"},
      {"roll":1021,"name":"T. Anusha","class":"10A","phone":"9848911021","att":"P","marks":42,"remarks":"Great commitment shown in afternoon remedial sessions"},
      {"roll":1022,"name":"V. Karthik","class":"10A","phone":"9848911022","att":"P","marks":34,"remarks":"Clarifies doubts regularly, formula retention is improving"},
      {"roll":1023,"name":"Y. Deepa","class":"10A","phone":"9848911023","att":"P","marks":43,"remarks":"Steady progress in weekly remedial math drills"},
      {"roll":1024,"name":"A. Sunil","class":"10A","phone":"9848911024","att":"P","marks":35,"remarks":"Very responsive to one-on-one coaching and practice papers"},
      {"roll":1025,"name":"B. Rohini","class":"10A","phone":"9848911025","att":"P","marks":44,"remarks":"Remedial focus: Practicing quadratic equations & trigonometry"},
      {"roll":1026,"name":"C. Prasad","class":"10A","phone":"9848911026","att":"P","marks":36,"remarks":"Board exam preparation: Improving step-by-step problem writing"},
      {"roll":1027,"name":"D. Sireesha","class":"10A","phone":"9848911027","att":"P","marks":45,"remarks":"Great commitment shown in afternoon remedial sessions"},
      {"roll":1028,"name":"G. Naveena","class":"10A","phone":"9848911028","att":"P","marks":37,"remarks":"Clarifies doubts regularly, formula retention is improving"},
      {"roll":1029,"name":"K. Ramu","class":"10A","phone":"9848911029","att":"P","marks":46,"remarks":"Steady progress in weekly remedial math drills"},
      {"roll":1030,"name":"M. Bindu","class":"10A","phone":"9848911030","att":"P","marks":38,"remarks":"Very responsive to one-on-one coaching and practice papers"},
      {"roll":1031,"name":"P. Santosh","class":"10A","phone":"9848911031","att":"P","marks":47,"remarks":"Remedial focus: Practicing quadratic equations & trigonometry"},
      {"roll":1032,"name":"R. Kalyani","class":"10A","phone":"9848911032","att":"P","marks":39,"remarks":"Board exam preparation: Improving step-by-step problem writing"}
    ],
    homework: [
      { id: 1, class: 'Class 8A', title: 'Chapter 2: Linear Equations Exercise 2.3', due: 'Sept 22, 2026', desc: 'Solve questions 1 through 8 in homework notebook. Step-by-step verification required.' },
      { id: 2, class: 'Class 9B', title: 'Polynomials Remainder Theorem Practice', due: 'Sept 23, 2026', desc: 'Complete worksheet questions 1 to 12. Bring graph sheets for plotting quadratic curves.' },
      { id: 3, class: 'Class 7C', title: 'Fractions Multiplication Drill', due: 'Sept 21, 2026', desc: 'Workbook page 34: Solve exercise 3.2 problems and verify with parent signature.' }
    ],
    parentMessages: [
      { id: 1, parent: 'Mrs. V. Sarada', student: 'V. Divya Bharathi (Roll 804)', date: 'Today, 08:30 AM', message: 'Dear Ms. Anjali, Divya will bring her math geometry set and completed assignment notebook today. Thank you for your guidance.' },
      { id: 2, parent: 'Mr. CH. Rambabu', student: 'CH. Karthik (Roll 841)', date: 'Yesterday, 06:15 PM', message: 'Respected Teacher, Karthik had fever yesterday and arrived slightly late today. He has completed Exercise 2.2.' }
    ],
    leaveHistory: [
      { id: 'LV-2026-081', type: 'Casual Leave (CL)', dates: 'Aug 14, 2026 (1 Day)', substitute: 'Sri P. Satyanarayana', reason: 'Personal family event', status: 'Approved by Principal' },
      { id: 'LV-2026-042', type: 'On Duty (OD)', dates: 'July 28, 2026 (1 Day)', substitute: 'Smt. S. Lakshmi', reason: 'District Math Teachers Training Workshop', status: 'Approved by Principal' }
    ]
  };

  let activeDossierRoll = null;

    function getISTDateTime() {
    const now = new Date();
    const dateOptions = {
      timeZone: 'Asia/Kolkata',
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    };
    const timeOptions = {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    const hourOptions = {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      hour12: false
    };

    const dateString = new Intl.DateTimeFormat('en-US', dateOptions).format(now);
    const timeString = new Intl.DateTimeFormat('en-US', timeOptions).format(now);
    const hour = parseInt(new Intl.DateTimeFormat('en-US', hourOptions).format(now), 10);
    const minute = now.getMinutes();
    const currentMinutes = hour * 60 + minute;

    return { dateString, timeString, hour, currentMinutes };
  }

  function getISTSalutation(hour) {
    if (hour >= 4 && hour < 12) {
      return 'Good Morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Good Afternoon';
    } else {
      return 'Good Evening';
    }
  }

  const TEACHER_DAILY_CLASSES = [
    { start: 540, end: 585, timeText: '09:00 – 09:45 AM' },
    { start: 600, end: 645, timeText: '10:00 – 10:45 AM' },
    { start: 765, end: 810, timeText: '12:45 – 01:30 PM' }
  ];

  function updateTodayClassesSchedule(currentMinutes) {
    const scheduleItems = document.querySelectorAll('.class-schedule-list .schedule-item');
    if (!scheduleItems || scheduleItems.length === 0) return;

    scheduleItems.forEach((item, index) => {
      const classDef = TEACHER_DAILY_CLASSES[index];
      if (!classDef) return;

      let badgeEl = item.querySelector('.schedule-live-badge');
      if (!badgeEl) {
        badgeEl = document.createElement('span');
        badgeEl.className = 'schedule-live-badge portal-badge';
        const h4 = item.querySelector('.schedule-details h4');
        if (h4) h4.appendChild(badgeEl);
      }

      if (currentMinutes >= classDef.start && currentMinutes < classDef.end) {
        item.classList.add('current');
        item.classList.remove('completed');
        badgeEl.className = 'schedule-live-badge portal-badge badge-primary';
        badgeEl.style.cssText = 'margin-left:0.5rem; background:#1d4ed8; color:#fff; font-size:0.75rem;';
        badgeEl.innerHTML = '<i class="fa-solid fa-circle-play"></i> LIVE NOW';
      } else if (currentMinutes >= classDef.end) {
        item.classList.remove('current');
        item.classList.add('completed');
        badgeEl.className = 'schedule-live-badge portal-badge badge-success';
        badgeEl.style.cssText = 'margin-left:0.5rem; font-size:0.75rem;';
        badgeEl.innerHTML = '<i class="fa-solid fa-check"></i> Completed';
      } else {
        item.classList.remove('current');
        item.classList.remove('completed');
        badgeEl.className = 'schedule-live-badge portal-badge badge-secondary';
        badgeEl.style.cssText = 'margin-left:0.5rem; font-size:0.75rem;';
        badgeEl.textContent = 'Upcoming';
      }
    });
  }

  function updateISTClock() {
    const { dateString, timeString, hour, currentMinutes } = getISTDateTime();
    const dateEl = document.getElementById('teacherDateText');
    if (dateEl) {
      dateEl.textContent = dateString;
    }
    const timeEl = document.getElementById('teacherTimeText');
    if (timeEl) {
      timeEl.textContent = `${timeString} IST`;
    }
    const bannerH1 = document.querySelector('.teacher-welcome-banner .tw-title');
    if (bannerH1 && state.teacher && state.teacher.name) {
      const salutation = getISTSalutation(hour);
      bannerH1.textContent = `${salutation}, ${state.teacher.name}`;
    }
    updateTodayClassesSchedule(currentMinutes);
  }

  function init() {
    // Filter out students withdrawn by Class Teacher
    const withdrawnRolls = JSON.parse(localStorage.getItem('sv_teacher_withdrawn_rolls') || '[]');
    const withdrawnAdms = JSON.parse(localStorage.getItem('sv_teacher_withdrawn_adms') || '[]');
    if (withdrawnRolls.length > 0 || withdrawnAdms.length > 0) {
      state.students = state.students.filter(s => !withdrawnRolls.includes(s.roll) && !withdrawnAdms.includes(s.admNo));
      state.classes.forEach(cls => {
        const activeCount = state.students.filter(s => s.class === cls.code || s.class === cls.id.toUpperCase()).length;
        if (activeCount > 0) {
          cls.strength = activeCount;
        }
      });
      state.teacher.totalStudents = state.students.length;
    }
    setupTheme();
    updateISTClock();
    setInterval(updateISTClock, 1000);
    loadSavedProfile();
    bindEvents();
    renderAll();
    setupHashRouting();
    applyTeacherDynamicPermissions();
    syncAdmittedStudentsFromStorage();

    window.addEventListener('storage', function(e) {
      if (!e.key || e.key === 'sv_teacher_new_admissions' || e.key === 'sv_enrolled_students' || e.key === 'sv_applications') {
        syncAdmittedStudentsFromStorage(true);
      }
    });

    // Listen for real-time permission modifications made by Principal, Vice Principal, or HOD
    window.addEventListener('storage', function(e) {
      if (e.key && (e.key.startsWith('sv_teacher_permissions') || e.key === 'sv_executive_restrictions')) {
        applyTeacherDynamicPermissions();
        if (state.activeModule && !checkModuleAccess(state.activeModule)) {
          navigateTo('dashboard');
        }
      }
    });

    if (window.ApiClient && window.ApiClient.isAuthenticated()) {
      loadLiveData();
    }
  }

  async function loadLiveData() {
    if (!window.ApiClient || !window.ApiClient.isAuthenticated()) return;

    try {
      // 1. Fetch Teacher Operational Dashboard
      const dash = await window.ApiClient.dashboard.getTeacherDashboard();
      if (dash) {
        if (dash.teacherProfile) {
          state.teacher.name = dash.teacherProfile.fullName;
          state.teacher.subject = dash.teacherProfile.specialization || 'Mathematics';
          state.teacher.role = `Class Teacher • Employee ID ${dash.teacherProfile.employeeId}`;
          updateTeacherHeaderDOM(dash.teacherProfile);
        }

        if (dash.classes) {
          state.teacher.totalClasses = dash.classes.assignedClassesCount;
          state.teacher.totalStudents = dash.classes.totalStudentsCount;
          if (dash.classes.list && dash.classes.list.length > 0) {
            state.classes = dash.classes.list.map(c => ({
              id: `${c.class}${c.section || 'A'}`.toLowerCase(),
              name: `Class ${c.class}${c.section || 'A'}`,
              isClassTeacher: c.isClassTeacher || false,
              strength: 42,
              room: 'Room 204',
              avgScore: '86.4%'
            }));
          }
        }

        if (dash.attendance) {
          state.teacher.todayAttendancePct = `${dash.attendance.markedCount > 0 ? '96%' : 'Pending'}`;
        }

        if (dash.assignments && dash.assignments.list) {
          state.homework = dash.assignments.list.map(h => ({
            id: h.id,
            class: `Class ${h.class}${h.section || 'A'}`,
            title: h.title,
            due: new Date(h.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            desc: h.description || 'Complete all exercises in notebook.'
          }));
          renderHomeworkFeed();
        }
      }

      // 2. Fetch Assigned Class Students
      const studentRes = await window.ApiClient.students.getStudents({ limit: 50 });
      if (studentRes && studentRes.data && studentRes.data.students && studentRes.data.students.length > 0) {
        state.students = studentRes.data.students.map((s, idx) => ({
          roll: parseInt(s.rollNo) || (801 + idx),
          name: s.fullName,
          class: `${s.class}${s.section || 'A'}`,
          phone: s.phone || '9848123000',
          att: 'P',
          marks: 44,
          remarks: 'Good classroom participation and consistent homework.'
        }));
        renderAttendanceMarkingTable();
        renderMarksEntryTable();
      }
    } catch (err) {
      console.warn('[teacherApp.loadLiveData error]:', err.message);
    }
  }

  function updateTeacherHeaderDOM(profile) {
    if (!profile) return;
    const nameEl = document.querySelector('.user-name, #teacherProfileName');
    if (nameEl) nameEl.textContent = profile.fullName;
    const roleEl = document.querySelector('.user-role, #teacherProfileRole');
    if (roleEl) roleEl.textContent = `${profile.specialization} Faculty (${profile.employeeId})`;
  }

  function setupTheme() {
    const saved = localStorage.getItem('sv_theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    updateThemeIcon(saved);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('sv_theme', next);
    updateThemeIcon(next);
    showToast(`Switched to ${next === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
  }

  function updateThemeIcon(theme) {
    const icon = document.getElementById('themeIcon');
    if (icon) {
      icon.className = theme === 'dark' ? 'fa-solid fa-sun theme-icon' : 'fa-solid fa-moon theme-icon';
    }
  }

  function bindEvents() {
    // Theme toggle
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

    // Mobile sidebar controller with backdrop & outside-click support
    const sidebar = document.getElementById('portalSidebar');
    const mobileBtn = document.getElementById('mobileSidebarToggle');

    window.closeTeacherMobileSidebar = function () {
      const sb = document.getElementById('portalSidebar');
      const bd = document.getElementById('portalBackdrop');
      if (sb) sb.classList.remove('mobile-open');
      if (bd) bd.classList.remove('active');
      document.body.classList.remove('sidebar-open');
    };

    window.openTeacherMobileSidebar = function () {
      const sb = document.getElementById('portalSidebar');
      let bd = document.getElementById('portalBackdrop');
      if (!bd) {
        bd = document.createElement('div');
        bd.id = 'portalBackdrop';
        bd.className = 'portal-backdrop';
        document.body.appendChild(bd);
        bd.addEventListener('click', window.closeTeacherMobileSidebar);
      }
      if (sb) sb.classList.add('mobile-open');
      bd.classList.add('active');
      document.body.classList.add('sidebar-open');
    };

    if (mobileBtn && sidebar) {
      mobileBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (sidebar.classList.contains('mobile-open')) {
          window.closeTeacherMobileSidebar();
        } else {
          window.openTeacherMobileSidebar();
        }
      });
    }

    const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
    if (sidebarCloseBtn) {
      sidebarCloseBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        window.closeTeacherMobileSidebar();
      });
    }

    document.addEventListener('click', function (e) {
      const sb = document.getElementById('portalSidebar');
      const mb = document.getElementById('mobileSidebarToggle');
      if (sb && sb.classList.contains('mobile-open')) {
        if (!sb.contains(e.target) && (!mb || !mb.contains(e.target))) {
          window.closeTeacherMobileSidebar();
        }
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        window.closeTeacherMobileSidebar();
      }
    });

    // Sidebar navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      const link = item.querySelector('.nav-link');
      const mod = item.getAttribute('data-module');
      const arrow = item.querySelector('.nav-arrow');
      const subLinks = item.querySelectorAll('.nav-sub-link');

      if (arrow) {
        arrow.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          const wasOpen = item.classList.contains('open');
          navItems.forEach(o => { if (o !== item) o.classList.remove('open'); });
          item.classList.toggle('open', !wasOpen);
        });
      }

      if (link) {
        link.addEventListener('click', function (e) {
          if (e.target.closest('.nav-arrow')) return;
          e.preventDefault();
          navigateTo(mod);

          const sb = document.getElementById('portalSidebar');
          if (window.innerWidth <= 1024 || (sb && sb.classList.contains('mobile-open'))) {
            if (typeof window.closeTeacherMobileSidebar === 'function') {
              window.closeTeacherMobileSidebar();
            }
          } else {
            navItems.forEach(o => { if (o !== item) o.classList.remove('open'); });
            item.classList.add('open');
          }
        });
      }

      subLinks.forEach(sub => {
        sub.addEventListener('click', function (e) {
          e.preventDefault();
          const subKey = sub.getAttribute('data-sub');
          subLinks.forEach(s => s.classList.remove('active'));
          sub.classList.add('active');
          navigateTo(mod, subKey);

          const sb = document.getElementById('portalSidebar');
          if (window.innerWidth <= 1024 || (sb && sb.classList.contains('mobile-open'))) {
            if (typeof window.closeTeacherMobileSidebar === 'function') {
              window.closeTeacherMobileSidebar();
            }
          }
        });
      });
    });
  }

  function setupHashRouting() {
    function handleHash() {
      const rawHash = (window.location.hash || '').replace('#', '').trim();
      let mod = null;
      let sub = null;

      if (rawHash) {
        if (rawHash === 'security' || rawHash === 'change-password' || rawHash === 'password') {
          navigateTo('profile', 'security');
          return;
        }
        if (rawHash.startsWith('profile-') || rawHash.startsWith('prof-')) {
          const profTab = rawHash.replace('profile-', '').replace('prof-', '');
          navigateTo('profile', profTab);
          return;
        }

        // Sublink aliases and prefixes
        if (rawHash.startsWith('my-classes')) {
          mod = 'my-classes';
          sub = rawHash.replace('my-classes-', '').replace('my-classes', '') || null;
        } else if (rawHash.startsWith('class-')) {
          mod = 'my-classes';
          sub = rawHash.replace('class-', '');
        } else if (rawHash.startsWith('students-')) {
          mod = 'students';
          sub = rawHash.replace('students-', '');
        } else if (rawHash.startsWith('attendance-')) {
          mod = 'attendance';
          sub = rawHash.replace('attendance-', '');
        } else if (rawHash.startsWith('academics-')) {
          mod = 'academics';
          sub = rawHash.replace('academics-', '');
        } else if (rawHash.startsWith('examinations-')) {
          mod = 'examinations';
          sub = rawHash.replace('examinations-', '');
        } else if (rawHash.startsWith('exams-')) {
          mod = 'examinations';
          sub = rawHash.replace('exams-', '');
        } else if (rawHash.startsWith('timetable-')) {
          mod = 'timetable';
          sub = rawHash.replace('timetable-', '');
        } else if (rawHash.startsWith('comm-')) {
          mod = 'communication';
          sub = rawHash.replace('comm-', '');
        } else if (rawHash.startsWith('communication-')) {
          mod = 'communication';
          sub = rawHash.replace('communication-', '');
        } else if (rawHash.startsWith('leave-')) {
          mod = 'leave';
          sub = rawHash.replace('leave-', '');
        } else if (rawHash.startsWith('reports-')) {
          mod = 'reports';
          sub = rawHash.replace('reports-', '');
        } else {
          const parts = rawHash.split('-');
          mod = parts[0];
          sub = parts.slice(1).join('-') || null;
        }
      } else {
        mod = sessionStorage.getItem('sv_teacher_last_module') || localStorage.getItem('sv_teacher_last_module') || 'dashboard';
        sub = sessionStorage.getItem('sv_teacher_last_sub') || localStorage.getItem('sv_teacher_last_sub') || null;
      }

      if (document.getElementById('view-' + mod)) {
        navigateTo(mod, sub);
      } else {
        navigateTo('dashboard');
      }
    }
    window.addEventListener('hashchange', handleHash);
    handleHash();
  }

  
  // =========================================================================
  // PRINCIPAL & VICE PRINCIPAL FACULTY ACCESS GOVERNANCE ENGINE
  // =========================================================================
  const DEFAULT_FACULTY_MODULE_PERMS = {
    'dashboard': true,
    'my-classes': true,
    'attendance': true,
    'academics': true,
    'assignments': true,
    'examinations': true,
    'timetable': true,
    'communication': true,
    'leave': true,
    'profile': true
  };

  function getFacultyPermissions(teacherId) {
    try {
      const activeId = teacherId || sessionStorage.getItem('sv_active_teacher_id') || 'SV200005';
      const stored = localStorage.getItem('sv_teacher_permissions_' + activeId);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Map granular keys to module keys
        

  return {
          'dashboard': true,
          'my-classes': parsed.class_sections !== false,
          'students': parsed.view_students !== false || parsed.student_profiles !== false,
          'attendance': parsed.mark_attendance !== false || parsed.view_attendance !== false,
          'academics': parsed.homework_assignments !== false || parsed.study_materials !== false,
          'examinations': parsed.enter_marks !== false || parsed.create_exams !== false,
          'timetable': parsed.view_timetable !== false,
          'communication': parsed.send_announcements !== false,
          'leave': parsed.apply_leave !== false,
          'reports': parsed.enter_marks !== false || parsed.student_profiles !== false,
          'profile': true
        };
      }
    } catch (e) {}
    return Object.assign({}, DEFAULT_FACULTY_MODULE_PERMS);
  }

  // --- Class Teacher Student Withdrawal Authority ---
  function promptWithdrawStudent(roll, name, className) {
    const cls = state.classes.find(c => c.code === className || c.id === className.toLowerCase());
    if (!cls || !cls.isClassTeacher) {
      notifyNonClassTeacherAttempt(name, className);
      return;
    }

    const nameEl = document.getElementById('withdrawStudentName');
    const classEl = document.getElementById('withdrawStudentClass');
    const rollEl = document.getElementById('withdrawStudentRoll');
    const teacherEl = document.getElementById('withdrawClassTeacherName');
    const rollInput = document.getElementById('withdrawStudentRollInput');
    const classInput = document.getElementById('withdrawStudentClassInput');
    const remarksInput = document.getElementById('withdrawRemarksInput');

    if (nameEl) nameEl.textContent = name;
    if (classEl) classEl.textContent = `Class ${className}`;
    if (rollEl) rollEl.textContent = `#${roll}`;
    if (teacherEl) teacherEl.textContent = state.teacher.name || 'Ms. Anjali';
    if (rollInput) rollInput.value = roll;
    if (classInput) classInput.value = className;
    if (remarksInput) {
      remarksInput.value = '';
      remarksInput.style.borderColor = '#cbd5e1';
      remarksInput.style.boxShadow = 'none';
    }

    openModal('withdrawStudentModal');
  }

  function notifyNonClassTeacherAttempt(name, className) {
    const msgEl = document.getElementById('nonClassTeacherMsg');
    if (msgEl) {
      msgEl.innerHTML = `Student <strong>${name}</strong> is enrolled in <strong>Class ${className}</strong>.<br><br>Under Sri Vidya statutory policy, only the officially designated <strong>Class Teacher of Class ${className}</strong> possesses authority to submit a student withdrawal or archival request. As subject/remedial faculty, you cannot withdraw or archive this student.`;
    }
    openModal('nonClassTeacherRestrictedModal');
  }

  function confirmWithdrawStudent() {
    const roll = parseInt(document.getElementById('withdrawStudentRollInput')?.value, 10);
    const className = document.getElementById('withdrawStudentClassInput')?.value;
    if (isNaN(roll)) return;

    const cls = state.classes.find(c => c.code === className || c.id === className.toLowerCase());
    if (!cls || !cls.isClassTeacher) {
      showToast(`Action Restricted: Only Class Teacher of Class ${className} can withdraw student.`, 'danger');
      return;
    }

    const remarksInput = document.getElementById('withdrawRemarksInput');
    const remarks = (remarksInput?.value || '').trim();
    if (!remarks || remarks.length < 5) {
      showToast('Mandatory Remark Required: Please write a remark explaining why you are withdrawing/deleting this student before proceeding.', 'danger');
      if (remarksInput) {
        remarksInput.focus();
        remarksInput.style.borderColor = '#dc2626';
        remarksInput.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.2)';
      }
      return;
    }

    const reason = document.getElementById('withdrawReasonSelect')?.value || 'Joined another school (Transfer)';
    const newSchool = (document.getElementById('withdrawNewSchoolInput')?.value || '').trim();

    const sIdx = state.students.findIndex(s => s.roll === roll && (s.class === className || s.class === cls.code));
    if (sIdx === -1) {
      closeModal('withdrawStudentModal');
      return;
    }

    const student = state.students[sIdx];
    const studentName = student.name;
    const studentAdmNo = student.admNo || ('SV-0' + roll);

    // 1. Remove from active state.students
    state.students.splice(sIdx, 1);

    // 2. Persist withdrawn rolls and adms in localStorage
    const withdrawnRolls = JSON.parse(localStorage.getItem('sv_teacher_withdrawn_rolls') || '[]');
    if (!withdrawnRolls.includes(roll)) {
      withdrawnRolls.push(roll);
      localStorage.setItem('sv_teacher_withdrawn_rolls', JSON.stringify(withdrawnRolls));
    }

    const withdrawnAdms = JSON.parse(localStorage.getItem('sv_teacher_withdrawn_adms') || '[]');
    if (student.admNo && !withdrawnAdms.includes(student.admNo)) {
      withdrawnAdms.push(student.admNo);
      localStorage.setItem('sv_teacher_withdrawn_adms', JSON.stringify(withdrawnAdms));
    }

    // 3. Save to formal withdrawn records for Main Department (Principal / VP)
    const departureNotice = {
      id: 'notif-dep-' + Date.now(),
      roll: roll,
      admNo: studentAdmNo,
      name: studentName,
      class: className,
      phone: student.phone || '—',
      reason: reason,
      newSchool: newSchool || 'Another School',
      remarks: remarks,
      reportedBy: `${state.teacher.name} (Class Teacher - ${className})`,
      reportedAt: new Date().toISOString(),
      dateFormatted: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    };

    const allWithdrawn = JSON.parse(localStorage.getItem('sv_withdrawn_students') || '[]');
    allWithdrawn.unshift(departureNotice);
    localStorage.setItem('sv_withdrawn_students', JSON.stringify(allWithdrawn));

    // Also persist into dedicated deletion remarks log
    try {
      const remarksLog = JSON.parse(localStorage.getItem('sv_deletion_remarks_log') || '[]');
      remarksLog.unshift({
        id: 'WD-' + Date.now(),
        type: 'Class Teacher Withdrawal',
        admNo: studentAdmNo,
        name: studentName,
        class: className,
        rollNo: roll,
        reason,
        newSchool,
        remarks,
        deletedBy: `${state.teacher.name} (Class Teacher - ${className})`,
        timestamp: new Date().toISOString(),
        formattedDate: new Date().toLocaleString('en-IN')
      });
      localStorage.setItem('sv_deletion_remarks_log', JSON.stringify(remarksLog));
    } catch (e) {}

    // 4. Send official notification to Main Department (Principal & VP)
    const mainDeptNotice = {
      id: 'notif-wd-' + Date.now(),
      title: `Student Departure: ${studentName} (Class ${className})`,
      text: `Class Teacher ${state.teacher.name} has withdrawn student ${studentName} (Roll #${roll}, Class ${className}) from class roster. Reason: ${reason}${newSchool ? ' (Joining ' + newSchool + ')' : ''}. Awaiting Principal / Vice Principal controlled record archival & TC clearance.`,
      type: 'warning',
      unread: true,
      time: 'Just now',
      timestamp: Date.now()
    };

    try {
      const existingNotifs = JSON.parse(localStorage.getItem('sv_notifications') || '[]');
      existingNotifs.unshift(mainDeptNotice);
      localStorage.setItem('sv_notifications', JSON.stringify(existingNotifs));
      localStorage.setItem('sv_notifications_all_read', 'false');
      localStorage.setItem('sv_departure_notice_alert', JSON.stringify(mainDeptNotice));
    } catch (e) {}

    // 5. Update class strength and badges
    if (cls) {
      cls.strength = Math.max(0, cls.strength - 1);
    }
    state.teacher.totalStudents = state.students.length;

    // 6. Close modal and re-render
    closeModal('withdrawStudentModal');
    filterStudentList();
    renderClassInfoBanner(className);
    if (typeof renderAttendanceMarkingTable === 'function') {
      renderAttendanceMarkingTable();
    }

    showToast(`Student ${studentName} removed from Class ${className} roster. Main Department (Principal & VP) notified.`, 'success');
  }


  function getRawTeacherPermissions(teacherId) {
    const activeId = teacherId || sessionStorage.getItem('sv_active_teacher_id') || 'SV200005';
    try {
      const stored = localStorage.getItem('sv_teacher_permissions_' + activeId);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {
      mark_attendance: true,
      view_attendance: true,
      class_sections: true,
      enter_marks: true,
      create_exams: false,
      student_profiles: true,
      homework_assignments: true,
      study_materials: true,
      view_timetable: true,
      send_announcements: true,
      apply_leave: true,
      view_students: true
    };
  }

  const DEFAULT_TEACHER_SUBMENU_PERMISSIONS = {
    'my-classes.classes': true,
    'my-classes.roster': true,
    'my-classes.profiles': true,
    'attendance.mark': true,
    'attendance.history': true,
    'attendance.corrections': true,
    'academics.plans': true,
    'academics.syllabus': true,
    'academics.materials': true,
    'assignments.create': true,
    'assignments.submissions': true,
    'assignments.grading': true,
    'examinations.schedule': true,
    'examinations.marks': true,
    'examinations.review': true,
    'timetable.my': true,
    'timetable.substitutions': true,
    'communication.announcements': true,
    'communication.messages': true,
    'communication.notices': true,
    'leave.apply': true,
    'leave.history': true,
    'profile.personal': true,
    'profile.documents': true,
    'profile.password': true
  };

  function getTeacherSubmenuPermissions(teacherId) {
    const activeId = teacherId || sessionStorage.getItem('sv_active_teacher_id') || 'SV200005';
    try {
      const stored = localStorage.getItem('sv_teacher_submenu_permissions_' + activeId);
      if (stored) return Object.assign({}, DEFAULT_TEACHER_SUBMENU_PERMISSIONS, JSON.parse(stored));
    } catch (e) {}
    return Object.assign({}, DEFAULT_TEACHER_SUBMENU_PERMISSIONS);
  }

  function syncTeacherTabStripPermissions(subPerms) {
    const tabs = document.querySelectorAll('.tab-btn[data-tab], .tab-btn[data-sub]');
    tabs.forEach(tab => {
      const sub = tab.getAttribute('data-tab') || tab.getAttribute('data-sub');
      const parentView = tab.closest('.portal-view');
      const modId = parentView ? parentView.id.replace('view-', '') : '';
      if (modId && sub) {
        const permKey = `${modId}.${sub}`;
        if (subPerms[permKey] === false) {
          tab.style.display = 'none';
        } else {
          tab.style.display = '';
        }
      }
    });
  }

  function applyTeacherDynamicPermissions() {
    const activeTeacherId = sessionStorage.getItem('sv_active_teacher_id') || 'SV200005';
    const modAccess = getFacultyPermissions(activeTeacherId);
    const subPerms = getTeacherSubmenuPermissions(activeTeacherId);
    const granular = getRawTeacherPermissions(activeTeacherId);

    // 1. Sidebar Modules & Granular Submenus
    const navItems = document.querySelectorAll('#teacherSidebarMenu .nav-item[data-module]');
    navItems.forEach(item => {
      const mod = item.getAttribute('data-module');
      if (mod === 'dashboard' || mod === 'profile') {
        item.style.display = '';
        return;
      }

      if (modAccess[mod] === false) {
        item.style.display = 'none';
        return;
      }

      const subLinks = item.querySelectorAll('.nav-sub-link');
      let visibleSubCount = 0;

      if (subLinks.length > 0) {
        subLinks.forEach(sub => {
          const subKey = sub.getAttribute('data-sub');
          const permKey = `${mod}.${subKey}`;
          const isAllowed = subPerms[permKey] !== false;
          // STRICTLY HIDDEN UP TO ALLOWING PERMISSION BY PRINCIPAL OR VP!
          sub.style.display = isAllowed ? '' : 'none';
          if (isAllowed) visibleSubCount++;
        });

        // If all submenus in this module are hidden, hide parent module
        item.style.display = (visibleSubCount > 0) ? '' : 'none';
      } else {
        const isAllowed = subPerms[mod] !== false;
        item.style.display = isAllowed ? '' : 'none';
      }
    });

    // Cleanly toggle sidebar section titles if all child modules in section are hidden
    const sectionTitles = document.querySelectorAll('#teacherSidebarMenu .nav-section-title');
    if (sectionTitles && sectionTitles.length >= 3) {
      // Section 1: TEACHER WORKSPACE
      const s1Mods = ['dashboard', 'my-classes', 'students', 'attendance', 'academics', 'examinations', 'timetable'];
      const s1Visible = s1Mods.some(m => {
        if (m === 'dashboard') return true;
        const el = document.querySelector(`#teacherSidebarMenu .nav-item[data-module="${m}"]`);
        return el && el.style.display !== 'none';
      });
      sectionTitles[0].style.display = s1Visible ? '' : 'none';

      // Section 2: CONNECT & LEAVE
      const s2Mods = ['communication', 'leave', 'reports'];
      const s2Visible = s2Mods.some(m => {
        const el = document.querySelector(`#teacherSidebarMenu .nav-item[data-module="${m}"]`);
        return el && el.style.display !== 'none';
      });
      sectionTitles[1].style.display = s2Visible ? '' : 'none';
    }

    // 2. Sync internal view tab strips
    syncTeacherTabStripPermissions(subPerms);

    // 3. Teacher Dashboard Actions & Metric Cards
    // Welcome Banner Quick Mark Attendance
    const quickAttBtn = document.querySelector('.teacher-welcome-banner button[onclick*="markAttendanceModal"]');
    if (quickAttBtn) quickAttBtn.style.display = (granular.mark_attendance !== false && subPerms['attendance.mark'] !== false ? '' : 'none');

    // Today's classes schedule buttons
    document.querySelectorAll('.schedule-actions button[onclick*="markAttendanceModal"]').forEach(b => {
      b.style.display = (granular.mark_attendance !== false && subPerms['attendance.mark'] !== false ? '' : 'none');
    });
    document.querySelectorAll('.schedule-actions button[onclick*="homework"]').forEach(b => {
      b.style.display = (granular.homework_assignments !== false && subPerms['academics.homework'] !== false ? '' : 'none');
    });
    document.querySelectorAll('.schedule-actions button[onclick*="materials"]').forEach(b => {
      b.style.display = (granular.study_materials !== false && subPerms['academics.materials'] !== false ? '' : 'none');
    });

    // Metric Cards on Dashboard
    const myClassesCard = document.querySelector('.metrics-quad .metric-card[onclick*="my-classes"]');
    if (myClassesCard) myClassesCard.style.display = (granular.class_sections !== false ? '' : 'none');

    const studentsCard = document.querySelector('.metrics-quad .metric-card[onclick*="students"]');
    if (studentsCard) studentsCard.style.display = (granular.view_students !== false || granular.student_profiles !== false ? '' : 'none');

    const attCard = document.querySelector('.metrics-quad .metric-card[onclick*="attendance"]');
    if (attCard) attCard.style.display = (granular.mark_attendance !== false || granular.view_attendance !== false ? '' : 'none');
  }

  function checkModuleAccess(moduleKey) {
    if (['dashboard', 'profile', 'appointments', 'tasks', 'assignments', 'timetable', 'students', 'my-classes', 'attendance', 'academics', 'examinations', 'communication', 'leave', 'reports'].includes(moduleKey)) return true;
    const perms = getFacultyPermissions();
    return perms[moduleKey] !== false;
  }

  function renderAccessLockedScreen(moduleKey) {
    const view = document.getElementById('view-' + moduleKey);
    if (!view) return;

    const titles = {
      'my-classes': 'Class & Section Roster Management',
      'students': 'Student Profiles & Dossiers',
      'attendance': 'Daily Attendance Register',
      'academics': 'Academic Lesson Plans & Materials',
      'examinations': 'Examinations & Marks Tabulation',
      'timetable': 'Master Teaching Timetable',
      'communication': 'Parent Broadcasts & Communication',
      'leave': 'Leave Applications & History',
      'reports': 'Student Performance Analytics'
    };

    const modTitle = titles[moduleKey] || moduleKey;
    const activeTeacherId = sessionStorage.getItem('sv_active_teacher_id') || 'SV200005';

    view.innerHTML = `
      <div class="card p-5 text-center mt-3" style="max-width: 680px; margin: 2rem auto; border: 2px dashed #cbd5e1; border-radius: 16px; box-shadow: 0 4px 18px rgba(0,0,0,0.03);">
        <div style="width: 70px; height: 70px; margin: 0 auto 1.25rem; border-radius: 50%; background: #fee2e2; color: #dc2626; display: flex; align-items: center; justify-content: center; font-size: 2rem;">
          <i class="fa-solid fa-lock"></i>
        </div>
        <span class="portal-badge badge-danger mb-2" style="font-size: 0.8rem; padding: 4px 12px;">Restricted Access</span>
        <h3 style="color: var(--color-text-dark); margin: 0.5rem 0 0.75rem 0; font-size: 1.4rem;">${modTitle} is Locked</h3>
        <p style="color: #64748b; font-size: 0.92rem; line-height: 1.6; margin-bottom: 1.5rem;">
          Access to this module is governed by the <strong>Principal &amp; Vice Principal</strong> via the Executive Governance Center.
          Your faculty account (<strong>${activeTeacherId}</strong>) has not been assigned active permissions for this capability.
        </p>
        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
          <button type="button" class="btn btn-primary" onclick="teacherApp.requestModuleAccess('${moduleKey}')" style="background: #059669; border-color: #059669;">
            <i class="fa-solid fa-paper-plane"></i> Request Access from Principal
          </button>
          <button type="button" class="btn btn-secondary" onclick="teacherApp.navigateTo('dashboard')">
            <i class="fa-solid fa-arrow-left"></i> Return to Dashboard
          </button>
        </div>
        <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #f1f5f9; font-size: 0.78rem; color: #94a3b8;">
          <i class="fa-solid fa-shield-halved"></i> Institutional Policy Matrix &bull; Sri Vidya E.M High School
        </div>
      </div>
    `;
  }

  function requestModuleAccess(moduleKey) {
    const activeTeacherId = sessionStorage.getItem('sv_active_teacher_id') || 'SV200005';
    try {
      const reqs = JSON.parse(localStorage.getItem('sv_faculty_access_requests') || '[]');
      reqs.push({
        teacherId: activeTeacherId,
        module: moduleKey,
        time: new Date().toLocaleString(),
        status: 'PENDING_EXECUTIVE_APPROVAL'
      });
      localStorage.setItem('sv_faculty_access_requests', JSON.stringify(reqs));
    } catch (e) {}

    showToast('Access request sent to Principal Dr. M. R. Krishna and Vice Principal!', 'success');
  }

  function unlockAllTeacherModulesForFaculty() {
    const activeTeacherId = sessionStorage.getItem('sv_active_teacher_id') || 'SV200005';
    const allUnlocked = {
      mark_attendance: true,
      view_attendance: true,
      class_sections: true,
      enter_marks: true,
      create_exams: true,
      student_profiles: true,
      homework_assignments: true,
      study_materials: true,
      view_timetable: true,
      send_announcements: true,
      apply_leave: true,
      view_students: true
    };
    try {
      localStorage.setItem('sv_teacher_permissions_' + activeTeacherId, JSON.stringify(allUnlocked));
      showToast('All teaching modules authorized and unlocked by Executive Administration!', 'success');
      navigateTo(state.activeModule || 'dashboard');
    } catch (e) {}
  }

  function renderFullTasksView() {
    if (typeof renderTasks === 'function') {
      try { renderTasks(); } catch (e) {}
    }
    const fullContainer = document.getElementById('fullTaskListContainer');
    if (!fullContainer) return;
    const taskList = (typeof state !== 'undefined' && state && Array.isArray(state.pendingTasks)) ? state.pendingTasks : [];
    fullContainer.innerHTML = taskList.map(task => `
      <div class="task-item ${task.done ? 'opacity-50' : ''}" style="padding: 0.85rem 1rem; border-bottom: 1px solid var(--color-border); display: flex; align-items: center; gap: 0.85rem; background: var(--color-bg-surface); border-radius: 8px; margin-bottom: 8px;">
        <input type="checkbox" class="task-checkbox" ${task.done ? 'checked' : ''} onchange="teacherApp.toggleTask(${task.id})">
        <div class="task-content" style="flex: 1;">
          <div class="task-title" style="font-weight: 600; font-size: 0.95rem; ${task.done ? 'text-decoration: line-through; color: #94a3b8;' : ''}">${task.title}</div>
          <div class="task-meta text-xs text-muted" style="margin-top: 0.25rem;">
            <span><i class="fa-regular fa-clock mr-1"></i> ${task.meta || 'Due Soon'}</span>
            <span class="portal-badge badge-${task.badge === 'due-today' ? 'danger' : 'primary'}" style="margin-left: 0.5rem; font-size: 0.72rem;">${task.badgeText || 'TASK'}</span>
          </div>
        </div>
        <span class="portal-badge badge-${task.done ? 'success' : 'warning'}">${task.done ? 'Completed' : 'Pending'}</span>
      </div>
    `).join('');
  }

  function navigateTo(moduleKey, subKey) {
    if (moduleKey === 'security' || moduleKey === 'change-password' || moduleKey === 'password') {
      moduleKey = 'profile';
      subKey = 'security';
    }

    // Default subKeys for modules with submenus when not specified
    if (!subKey) {
      if (moduleKey === 'my-classes') subKey = 'classes';
      else if (moduleKey === 'attendance') subKey = 'mark';
      else if (moduleKey === 'academics') subKey = 'plans';
      else if (moduleKey === 'assignments') subKey = 'create';
      else if (moduleKey === 'examinations') subKey = 'schedule';
      else if (moduleKey === 'timetable') subKey = 'my';
      else if (moduleKey === 'leave') subKey = 'apply';
    }

    const view = document.getElementById('view-' + moduleKey);
    if (!view) return;

    // Close any lingering modal overlays
    if (typeof closeModal === 'function') {
      try { closeModal('createHomeworkModal'); } catch (e) {}
      try { closeModal('applyLeaveModal'); } catch (e) {}
      try { closeModal('markAttendanceModal'); } catch (e) {}
    }
    document.querySelectorAll('.modal.active, .portal-modal.active').forEach(m => m.classList.remove('active'));
    document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());

    // Verify Access Permissions set by Principal / Vice Principal
    if (!checkModuleAccess(moduleKey)) {
      showToast(`Access restricted: Module '${moduleKey}' is turned off for your faculty account by School Leadership.`, 'error');
      if (moduleKey !== 'dashboard') {
        navigateTo('dashboard');
        return;
      }
      renderAccessLockedScreen(moduleKey);
    }

    state.activeModule = moduleKey;

    try {
      sessionStorage.setItem('sv_teacher_last_module', moduleKey);
      localStorage.setItem('sv_teacher_last_module', moduleKey);
      if (subKey) {
        sessionStorage.setItem('sv_teacher_last_sub', subKey);
        localStorage.setItem('sv_teacher_last_sub', subKey);
      } else {
        sessionStorage.removeItem('sv_teacher_last_sub');
        localStorage.removeItem('sv_teacher_last_sub');
      }
      const targetHash = (subKey && subKey !== 'security') ? `${moduleKey}-${subKey}` : (subKey === 'security' ? 'security' : moduleKey);
      if (window.location.hash.replace('#', '') !== targetHash) {
        history.replaceState(null, '', '#' + targetHash);
      }
    } catch (e) {}

    // Active sidebar highlight & auto-open submenu
    document.querySelectorAll('.nav-item').forEach(item => {
      const itemMod = item.getAttribute('data-module');
      if (itemMod === moduleKey) {
        item.classList.add('active');
        item.classList.add('open');
      } else {
        item.classList.remove('active');
      }
    });

    // Active nav-sub-link highlight
    document.querySelectorAll('.nav-sub-link').forEach(link => {
      const parentMod = link.closest('.nav-item')?.getAttribute('data-module');
      const linkSub = link.getAttribute('data-sub');
      if (parentMod === moduleKey && linkSub === subKey) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Hide other views, show target
    document.querySelectorAll('.portal-view').forEach(v => v.classList.remove('active'));
    view.classList.add('active');
    if (moduleKey === 'tasks') {
      renderFullTasksView();
    }

    // Breadcrumb title resolution for all 20 submenus
    const crumb = document.getElementById('teacherCurrentPageCrumb');
    if (crumb) {
      const subTitles = {
        'dashboard': 'Dashboard',
        'my-classes': {
          'classes': 'My Classes & Responsibilities',
          'roster': 'Class Lists & Roster',
          'profiles': 'Student Profiles'
        },
        'students': 'Student Profiles & Dossiers',
        'attendance': {
          'mark': 'Mark Attendance',
          'history': 'Attendance History',
          'report': 'Absentee Summary',
          'corrections': 'Attendance Correction Requests'
        },
        'academics': {
          'plans': 'Lesson Plans',
          'syllabus': 'Syllabus Progress',
          'materials': 'Study Materials & Question Banks'
        },
        'assignments': {
          'create': 'Assignments & Tasks',
          'submissions': 'Student Submissions & Evaluation'
        },
        'examinations': {
          'schedule': 'Examination Schedule',
          'enter-marks': 'Enter Marks',
          'review': 'Marks Review & Moderation'
        },
        'timetable': {
          'my': 'My Timetable',
          'substitutions': 'Substitution Schedule'
        },
        'appointments': 'Parent Meetings & PTM Consultations',
        'communication': 'Class Announcements & Circulars',
        'leave': {
          'apply': 'Apply Leave',
          'history': 'Leave History & Applications'
        },
        'tasks': 'My Tasks & Deadlines',
        'profile': 'My Profile & Account Security'
      };

      if (subTitles[moduleKey]) {
        if (typeof subTitles[moduleKey] === 'object' && subKey && subTitles[moduleKey][subKey]) {
          crumb.textContent = subTitles[moduleKey][subKey];
        } else if (typeof subTitles[moduleKey] === 'string') {
          crumb.textContent = subTitles[moduleKey];
        } else {
          crumb.textContent = moduleKey;
        }
      } else {
        crumb.textContent = moduleKey;
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (moduleKey === 'my-classes') {
      if (['classes', 'roster', 'profiles', 'parents'].includes(subKey)) {
        switchSubTab('my-classes', subKey);
      } else {
        const targetClass = subKey || '8a';
        switchClassTab(targetClass);
      }
    } else if (subKey) {
      switchSubTab(moduleKey, subKey);
    }
  }

  function switchSubTab(moduleKey, subKey) {
    // Exact user-specified 10 modules subtab handler
    if (moduleKey === 'profile') {
      if (typeof switchProfileTab === 'function') {
        switchProfileTab(subKey);
      }
      return;
    }
    if (moduleKey === 'my-classes') {
      document.querySelectorAll('.my-classes-subview').forEach(p => p.style.display = 'none');
      if (subKey === 'classes') {
        const p = document.getElementById('subtab-classes-panel');
        if (p) p.style.display = 'block';
        if (typeof renderClassesGrid === 'function') renderClassesGrid();
      } else if (subKey === 'roster') {
        const p = document.getElementById('subtab-roster-panel');
        if (p) p.style.display = 'block';
        if (typeof renderClassListRoster === 'function') renderClassListRoster('8A');
      } else if (subKey === 'profiles') {
        const p = document.getElementById('subtab-profiles-panel');
        if (p) p.style.display = 'block';
        if (typeof searchStudentProfile === 'function') searchStudentProfile('804');
      }
    }
    if (moduleKey === 'attendance') {
      const corrPanel = document.getElementById('subview-attendance-corrections');
      if (corrPanel) corrPanel.style.display = (subKey === 'corrections') ? 'block' : 'none';
    }
    
    
    if (moduleKey === 'examinations') {
      if (subKey === 'review') {
        showToast('Marks submitted to Exam Cell & Principal for final moderation and review.', 'success');
      }
    }

    // Sub-router for the 7 focused workspace modules
    if (moduleKey === 'my-classes') {
      renderMyClassesSubTab(subKey);
    } else if (moduleKey === 'attendance') {
      renderAttendanceEnhancedSubTab(subKey);
    } else if (moduleKey === 'academics') {
      renderAcademicsEnhancedSubTab(subKey);
    } else if (moduleKey === 'examinations') {
      renderExaminationsEnhancedSubTab(subKey);
    } else if (moduleKey === 'communication') {
      renderCommunicationEnhancedSubTab(subKey);
    } else if (moduleKey === 'timetable') {
      renderTimetableEnhancedSubTab(subKey);
    }

    state.activeSubTab[moduleKey] = subKey;
    const view = document.getElementById('view-' + moduleKey);
    if (!view) return;

    // Update tab strip active buttons
    const strip = view.querySelector('.tab-strip');
    if (strip) {
      strip.querySelectorAll('.tab-btn').forEach(btn => {
        const text = btn.textContent.toLowerCase();
        const onclickAttr = btn.getAttribute('onclick') || '';
        if (text.includes(subKey.toLowerCase()) || onclickAttr.includes(`'${subKey}'`)) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    // Module-specific interactive subtab rendering
    if (moduleKey === 'my-classes') {
      switchClassTab(subKey);
    } else if (moduleKey === 'academics') {
      renderAcademicsSubTab(subKey);
    } else if (moduleKey === 'assignments') {
      renderAssignmentsSubTab(subKey);
    } else if (moduleKey === 'students') {
      renderStudentsSubTab(subKey);
    } else if (moduleKey === 'attendance') {
      renderAttendanceSubTab(subKey);
    } else if (moduleKey === 'examinations') {
      renderExaminationsSubTab(subKey);
    } else if (moduleKey === 'timetable') {
      renderTimetableSubTab(subKey);
    } else if (moduleKey === 'communication') {
      renderCommunicationSubTab(subKey);
    } else if (moduleKey === 'leave') {
      renderLeaveSubTab(subKey);
    } else if (moduleKey === 'reports') {
      renderReportsSubTab(subKey);
    }
  }

  function renderAcademicsSubTab(subKey) {
    const container = document.getElementById('homeworkFeedContainer');
    if (!container) return;

    if (subKey === 'assignments' || subKey === 'homework') {
      renderHomeworkFeed();
      showToast(`Showing Homework & Assignments`, 'info');
    } else if (subKey === 'materials') {
      container.innerHTML = `
        <div class="card p-4 mb-3">
          <div class="card-header-bar">
            <div>
              <h3><i class="fa-solid fa-folder-open text-primary"></i> Study Materials & Question Banks</h3>
              <p class="text-muted text-sm mt-1">Syllabus-aligned Mathematics study guides and practice sheets.</p>
            </div>
            <button class="btn btn-primary btn-sm" onclick="teacherApp.showToast('Select PDF file to upload to class repository', 'info')">
              <i class="fa-solid fa-cloud-arrow-up"></i> Upload Document
            </button>
          </div>
          <div class="table-container mt-3">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Document Title</th>
                  <th>Target Class</th>
                  <th>Uploaded Date</th>
                  <th>File Size</th>
                  <th class="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Chapter 2: Linear Equations Formula Sheet & Notes</strong></td>
                  <td><span class="portal-badge badge-primary">Class 8A</span></td>
                  <td>Sept 15, 2026</td>
                  <td>2.4 MB (PDF)</td>
                  <td class="text-center"><button class="btn btn-secondary btn-sm" onclick="teacherApp.showToast('Downloaded Linear Equations Notes', 'success')"><i class="fa-solid fa-download"></i> Download</button></td>
                </tr>
                <tr>
                  <td><strong>Polynomials & Factor Theorem Solved Examples</strong></td>
                  <td><span class="portal-badge badge-primary">Class 9B</span></td>
                  <td>Sept 12, 2026</td>
                  <td>3.1 MB (PDF)</td>
                  <td class="text-center"><button class="btn btn-secondary btn-sm" onclick="teacherApp.showToast('Downloaded Polynomials Guide', 'success')"><i class="fa-solid fa-download"></i> Download</button></td>
                </tr>
                <tr>
                  <td><strong>Grade 7 Fractions Multiplication Drill Workbook</strong></td>
                  <td><span class="portal-badge badge-primary">Class 7C</span></td>
                  <td>Sept 08, 2026</td>
                  <td>1.8 MB (PDF)</td>
                  <td class="text-center"><button class="btn btn-secondary btn-sm" onclick="teacherApp.showToast('Downloaded Grade 7 Workbook', 'success')"><i class="fa-solid fa-download"></i> Download</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
      showToast('Loaded Study Materials & PDFs', 'info');
    } else if (subKey === 'plans') {
      container.innerHTML = `
        <div class="card p-4 mb-3">
          <div class="card-header-bar">
            <div>
              <h3><i class="fa-solid fa-list-check text-primary"></i> Weekly Academic Lesson Plans</h3>
              <p class="text-muted text-sm mt-1">Teaching objectives, curriculum milestones, and pedagogy plan.</p>
            </div>
            <button class="btn btn-primary btn-sm" onclick="teacherApp.showToast('Lesson plan draft updated', 'success')">
              <i class="fa-solid fa-pen-to-square"></i> Edit Plan
            </button>
          </div>
          <div class="table-container mt-3">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Class</th>
                  <th>Core Topic</th>
                  <th>Learning Objectives</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Period 1</td>
                  <td><strong>Class 8A</strong></td>
                  <td>Linear Equations in One Variable (Ex 2.3)</td>
                  <td>Solving equations having the variable on both sides</td>
                  <td><span class="portal-badge badge-success">Completed</span></td>
                </tr>
                <tr>
                  <td>Period 2</td>
                  <td><strong>Class 9B</strong></td>
                  <td>Polynomials: Factor Theorem & Remainder</td>
                  <td>Verification of roots through algebraic identities</td>
                  <td><span class="portal-badge badge-primary">In Progress</span></td>
                </tr>
                <tr>
                  <td>Period 4</td>
                  <td><strong>Class 7C</strong></td>
                  <td>Fractions & Decimals Multiplication</td>
                  <td>Visual model of area multiplication for fractions</td>
                  <td><span class="portal-badge badge-warning">Next Session</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
      showToast('Loaded Weekly Lesson Plans', 'info');
    } else if (subKey === 'syllabus') {
      container.innerHTML = `
        <div class="card p-4 mb-3">
          <div class="card-header-bar">
            <div>
              <h3><i class="fa-solid fa-bars-progress text-primary"></i> Term 1 Syllabus Tracker</h3>
              <p class="text-muted text-sm mt-1">Quarterly examination readiness across assigned classes.</p>
            </div>
            <span class="portal-badge badge-success">Overall: 84% Completed</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;">
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
                <strong>Class X-A AP SCERT Telugu (Target: 4 Sections)</strong>
                <span>75% Complete</span>
              </div>
              <div style="width: 100%; height: 10px; background: var(--color-bg-subtle); border-radius: 5px; overflow: hidden;">
                <div style="width: 75%; height: 100%; background: var(--color-primary);"></div>
              </div>
              <small class="text-muted">Sections: Prose, Poetry, Non-Detailed Text (Upavaachakam), Grammar &amp; Language Topics.</small>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
                <strong>Class X-A AP SSC Hindi (Target: 14 Topics)</strong>
                <span>0% Complete</span>
              </div>
              <div style="width: 100%; height: 10px; background: var(--color-bg-subtle); border-radius: 5px; overflow: hidden;">
                <div style="width: 0%; height: 100%; background: var(--color-accent-red);"></div>
              </div>
              <small class="text-muted">Topics: Baraste Badal, Idgah, Hum Bharatwasi, Kan-Kan Ka Adhikari, Lokgeet, International Hindi, Bhakti Pad, Swarajya ki Neev, Dakshini Ganga Godavari, Niti ke Dohe, Jal hi Jeevan Hai, Dharti ke Sawaal, Antariksha ke Jawaab, and Upavachak Parts 1 and 2. Completed topics: none.</small>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
                <strong>Class X-A BSEAP English (Target: 4 Sections)</strong>
                <span>75% Complete</span>
              </div>
              <div style="width: 100%; height: 10px; background: var(--color-bg-subtle); border-radius: 5px; overflow: hidden;">
                <div style="width: 75%; height: 100%; background: var(--color-primary);"></div>
              </div>
              <small class="text-muted">Completed: Reading (30 marks), Writing (30 marks), Grammar &amp; Vocabulary (20 marks). Pending: Literature (20 marks) covering prose, poetry, drama, and the prescribed thematic units. Total: 100 marks.</small>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
                <strong>Class X-A AP SSC Mathematics (Target: 14 Units)</strong>
                <span>86% Complete</span>
              </div>
              <div style="width: 100%; height: 10px; background: var(--color-bg-subtle); border-radius: 5px; overflow: hidden;">
                <div style="width: 86%; height: 100%; background: var(--color-primary);"></div>
              </div>
              <small class="text-muted">Units covered: Real Numbers, Sets, Polynomials, Pair of Linear Equations, Quadratic Equations, Progressions, Coordinate Geometry, Similar Triangles, Tangents and Secants, Mensuration, Trigonometry, Applications of Trigonometry, Probability, Statistics.</small>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
                <strong>Class X-A AP SSC Physics</strong>
                <span>71% Complete</span>
              </div>
              <div style="width: 100%; height: 10px; background: var(--color-bg-subtle); border-radius: 5px; overflow: hidden;">
                <div style="width: 71%; height: 100%; background: var(--color-accent-purple);"></div>
              </div>
              <small class="text-muted">Topics covered: Light – Reflection and Refraction; The Human Eye and Colourful World; Electricity; Magnetic Effects of Electric Current; Heat. Current tracker progress: 10 of 14 topics.</small>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
                <strong>Class X-A AP SSC Chemistry (Target: 5 Units)</strong>
                <span>80% Complete</span>
              </div>
              <div style="width: 100%; height: 10px; background: var(--color-bg-subtle); border-radius: 5px; overflow: hidden;">
                <div style="width: 80%; height: 100%; background: var(--color-accent-green);"></div>
              </div>
              <small class="text-muted">Units covered: Chemical Reactions and Equations; Acids, Bases and Salts; Metals and Non-metals; Carbon and Its Compounds. Unit 5 pending: Structure of Atom &amp; Classification of Elements.</small>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
                <strong>Class X-A AP SSC Biology (Target: 10 Chapters)</strong>
                <span>80% Complete</span>
              </div>
              <div style="width: 100%; height: 10px; background: var(--color-bg-subtle); border-radius: 5px; overflow: hidden;">
                <div style="width: 80%; height: 100%; background: var(--color-accent-purple);"></div>
              </div>
              <small class="text-muted">Completed chapters: Nutrition, Respiration, Transportation, Excretion, Coordination, Reproduction, Coordination in Life Processes, Heredity. Pending: Our Environment and Natural Resources.</small>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
                <strong>Class X-A AP SSC Social Studies (Target: 4 Sections)</strong>
                <span>75% Complete</span>
              </div>
              <div style="width: 100%; height: 10px; background: var(--color-bg-subtle); border-radius: 5px; overflow: hidden;">
                <div style="width: 75%; height: 100%; background: var(--color-primary);"></div>
              </div>
              <small class="text-muted">Completed sections: Geography (5 chapters), Economics (6 chapters), and History (7 chapters). Pending: Civics / Political Science (3 chapters covering the Constitution, elections, and social movements).</small>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
                <strong>Class 9B Mathematics (Quarterly Target: 5 Chapters)</strong>
                <span>80% Complete</span>
              </div>
              <div style="width: 100%; height: 10px; background: var(--color-bg-subtle); border-radius: 5px; overflow: hidden;">
                <div style="width: 80%; height: 100%; background: var(--color-accent-green);"></div>
              </div>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.35rem;">
                <strong>Class 7C Mathematics (Quarterly Target: 4 Chapters)</strong>
                <span>85% Complete</span>
              </div>
              <div style="width: 100%; height: 10px; background: var(--color-bg-subtle); border-radius: 5px; overflow: hidden;">
                <div style="width: 85%; height: 100%; background: var(--color-accent-purple);"></div>
              </div>
            </div>
          </div>
        </div>
      `;
      showToast('Loaded Syllabus Tracker', 'info');
    }
  }

  function renderStudentsSubTab(subKey) {
    const tableContainer = document.querySelector('#view-students .table-container');
    if (!tableContainer) return;

    const classVal = document.getElementById('studentClassFilterSelect')?.value || '8A';
    const studentsList = (classVal === 'ALL') ? state.students : state.students.filter(s => s.class === classVal);

    if (subKey === 'list') {
      renderStudentsList(studentsList);
      tableContainer.style.display = 'block';
      const extraDiv = document.getElementById('studentsExtraSubView');
      if (extraDiv) extraDiv.remove();
      showToast(`Showing Student List (${studentsList.length} members)`, 'info');
    } else if (subKey === 'profile') {
      tableContainer.style.display = 'none';
      let extraDiv = document.getElementById('studentsExtraSubView');
      if (!extraDiv) {
        extraDiv = document.createElement('div');
        extraDiv.id = 'studentsExtraSubView';
        tableContainer.parentNode.appendChild(extraDiv);
      }
      extraDiv.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; margin-top: 1rem;">
          ${studentsList.map(s => `
            <div class="card p-3" style="border: 1px solid var(--color-border); border-radius: var(--radius-md);">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="width: 44px; height: 44px; border-radius: 50%; background: var(--color-primary); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700;">
                  #${s.roll}
                </div>
                <div>
                  <h4 style="margin: 0; font-size: 0.95rem;">${s.name}</h4>
                  <span class="text-muted text-xs">Grade ${s.class} • Roll #${s.roll}</span>
                </div>
              </div>
              <div style="margin-top: 0.75rem; padding: 0.5rem; background: var(--color-bg-subtle); border-radius: 6px; font-size: 0.82rem;">
                <div><strong>Attendance:</strong> ${s.att === 'P' ? '96% (Present Today)' : (s.att === 'L' ? '91% (Late Today)' : '86% (Absent Today)')}</div>
                <div style="margin-top: 0.25rem;"><strong>Maths UT-2:</strong> ${s.marks}/50 (${s.marks*2}%)</div>
                <div style="margin-top: 0.25rem;"><strong>Parent Phone:</strong> <a href="tel:${s.phone}">${s.phone}</a></div>
              </div>
              <button class="btn btn-secondary btn-sm mt-3" style="width: 100%;" onclick="teacherApp.viewStudentDossier(${s.roll})">
                <i class="fa-regular fa-id-badge"></i> View Full Dossier
              </button>
            </div>
          `).join('')}
        </div>
      `;
      showToast(`Loaded ${studentsList.length} Student Dossiers`, 'info');
    } else if (subKey === 'att-history') {
      tableContainer.style.display = 'none';
      let extraDiv = document.getElementById('studentsExtraSubView');
      if (!extraDiv) {
        extraDiv = document.createElement('div');
        extraDiv.id = 'studentsExtraSubView';
        tableContainer.parentNode.appendChild(extraDiv);
      }
      extraDiv.innerHTML = `
        <div class="card p-4">
          <div class="card-header-bar">
            <div>
              <h3>Monthly Attendance Roster — Grade ${classVal}</h3>
              <p class="text-muted text-sm mt-1">Total Academic Days in Term: 24 Days • Section Rate: 95.8%</p>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="window.print()"><i class="fa-solid fa-print"></i> Print Register</button>
          </div>
          <div class="table-container mt-3">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="text-center">Roll #</th>
                  <th>Student Name</th>
                  <th class="text-center">Days Present</th>
                  <th class="text-center">Days Absent</th>
                  <th class="text-center">Monthly %</th>
                  <th class="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                ${studentsList.slice(0, 15).map(s => {
                  const presDays = s.att === 'A' ? 22 : 24;
                  const absDays = s.att === 'A' ? 2 : 0;
                  const pct = ((presDays / 24) * 100).toFixed(1);
                  return `
                    <tr>
                      <td class="text-center"><strong>#${s.roll}</strong></td>
                      <td><strong>${s.name}</strong></td>
                      <td class="text-center">${presDays} / 24</td>
                      <td class="text-center">${absDays}</td>
                      <td class="text-center"><strong>${pct}%</strong></td>
                      <td class="text-center"><span class="portal-badge ${pct >= 90 ? 'badge-success' : 'badge-warning'}">${pct >= 90 ? 'Regular' : 'Review'}</span></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
      showToast('Loaded Attendance Track Records', 'info');
    } else if (subKey === 'perf') {
      tableContainer.style.display = 'none';
      let extraDiv = document.getElementById('studentsExtraSubView');
      if (!extraDiv) {
        extraDiv = document.createElement('div');
        extraDiv.id = 'studentsExtraSubView';
        tableContainer.parentNode.appendChild(extraDiv);
      }
      extraDiv.innerHTML = `
        <div class="card p-4">
          <div class="card-header-bar">
            <div>
              <h3>Academic Assessment Dossier — Grade ${classVal}</h3>
              <p class="text-muted text-sm mt-1">Unit Test 1 (25M), Unit Test 2 (50M), and Overall Term Grade.</p>
            </div>
            <button class="btn btn-primary btn-sm" onclick="teacherApp.navigateTo('examinations', 'enter-marks')"><i class="fa-solid fa-file-pen"></i> Enter Marks</button>
          </div>
          <div class="table-container mt-3">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="text-center">Roll #</th>
                  <th>Student Name</th>
                  <th class="text-center">UT-1 (25M)</th>
                  <th class="text-center">UT-2 (50M)</th>
                  <th class="text-center">Term Avg %</th>
                  <th class="text-center">Grade</th>
                </tr>
              </thead>
              <tbody>
                ${studentsList.slice(0, 15).map(s => {
                  const ut1 = Math.round(s.marks * 0.48);
                  const termPct = Math.round(((ut1/25 + s.marks/50) / 2) * 100);
                  const grade = termPct >= 90 ? 'O' : (termPct >= 80 ? 'A' : (termPct >= 70 ? 'B' : (termPct >= 60 ? 'C' : (termPct >= 40 ? 'D' : 'E'))));
                  return `
                    <tr>
                      <td class="text-center"><strong>#${s.roll}</strong></td>
                      <td><strong>${s.name}</strong></td>
                      <td class="text-center">${ut1} / 25</td>
                      <td class="text-center"><strong>${s.marks} / 50</strong></td>
                      <td class="text-center"><strong>${termPct}%</strong></td>
                      <td class="text-center"><span class="portal-badge ${(grade === 'O' || grade === 'A') ? 'badge-success' : ((grade === 'B' || grade === 'C') ? 'badge-primary' : (grade === 'D' ? 'badge-warning' : 'badge-danger'))}">${grade}</span></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
      showToast('Loaded Academic Marks Dossier', 'info');
    }
  }

  function renderAttendanceSubTab(subKey) {
    const card = document.querySelector('#view-attendance .card');
    if (!card) return;

    let extraDiv = document.getElementById('attendanceSubExtraView');
    const tableContainer = card.querySelector('.table-container');
    const visualStrip = card.querySelector('.attendance-visual-strip');

    if (subKey === 'mark') {
      if (extraDiv) extraDiv.style.display = 'none';
      if (tableContainer) tableContainer.style.display = 'block';
      if (visualStrip) visualStrip.style.display = 'flex';
      renderAttendanceMarkingTable();
      showToast('Showing Daily Register Table & Live Ratio Chart', 'info');
    } else if (subKey === 'history') {
      if (tableContainer) tableContainer.style.display = 'none';
      if (visualStrip) visualStrip.style.display = 'none';
      if (!extraDiv) {
        extraDiv = document.createElement('div');
        extraDiv.id = 'attendanceSubExtraView';
        card.appendChild(extraDiv);
      }
      extraDiv.style.display = 'block';
      extraDiv.innerHTML = `
        <div class="mt-3">
          <div class="chart-card mb-3">
            <div class="chart-title-wrap">
              <h4><i class="fa-solid fa-chart-column text-primary"></i> Class 8A Weekly Attendance Pacing (September 2026)</h4>
              <span class="portal-badge badge-success">Target: 95.0% Goal Met</span>
            </div>
            <div class="bar-chart-container">
              <div class="bar-chart-row">
                <div class="bar-header">
                  <span class="bar-label"><i class="fa-regular fa-calendar-check text-emerald"></i> Week 1 (Sept 1 – 5): 5 Teaching Days</span>
                  <span class="bar-value text-emerald">96.5% Presence (40.5 avg present)</span>
                </div>
                <div class="bar-track">
                  <div class="bar-fill fill-emerald" style="width: 96.5%;"></div>
                </div>
              </div>
              <div class="bar-chart-row">
                <div class="bar-header">
                  <span class="bar-label"><i class="fa-regular fa-calendar-check text-blue"></i> Week 2 (Sept 8 – 12): 5 Teaching Days</span>
                  <span class="bar-value text-primary">95.2% Presence (40.0 avg present)</span>
                </div>
                <div class="bar-track">
                  <div class="bar-fill fill-blue" style="width: 95.2%;"></div>
                </div>
              </div>
              <div class="bar-chart-row">
                <div class="bar-header">
                  <span class="bar-label"><i class="fa-regular fa-calendar-check text-emerald"></i> Week 3 (Sept 15 – 19): 5 Teaching Days</span>
                  <span class="bar-value text-emerald">97.6% Presence (41.0 avg present)</span>
                </div>
                <div class="bar-track">
                  <div class="bar-fill fill-emerald" style="width: 97.6%;"></div>
                </div>
              </div>
              <div class="bar-chart-row">
                <div class="bar-header">
                  <span class="bar-label"><i class="fa-regular fa-calendar text-purple"></i> Month Pacing Projection (Full Term)</span>
                  <span class="bar-value" style="color: #8B5CF6;">96.4% Expected Cumulative</span>
                </div>
                <div class="bar-track">
                  <div class="bar-fill fill-purple" style="width: 96.4%;"></div>
                </div>
              </div>
            </div>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" onclick="teacherApp.switchSubTab('attendance', 'mark')">
            <i class="fa-solid fa-arrow-left"></i> Return to Daily Register
          </button>
        </div>
      `;
      showToast('Loaded Monthly Attendance Pacing Bar Graph', 'info');
    } else if (subKey === 'report') {
      if (tableContainer) tableContainer.style.display = 'none';
      if (visualStrip) visualStrip.style.display = 'none';
      if (!extraDiv) {
        extraDiv = document.createElement('div');
        extraDiv.id = 'attendanceSubExtraView';
        card.appendChild(extraDiv);
      }
      extraDiv.style.display = 'block';
      const class8A = state.students.filter(s => s.class === '8A');
      const absentees = class8A.filter(s => s.att === 'A' || s.att === 'L');
      extraDiv.innerHTML = `
        <div class="mt-3">
          <div class="card-header-bar mb-2">
            <h4><i class="fa-solid fa-user-xmark text-danger"></i> Today's Absentee & Late Arrivals Log</h4>
            <span class="portal-badge badge-danger">${absentees.length} Students Requiring Attention</span>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th class="text-center">Roll #</th>
                  <th>Student Name</th>
                  <th class="text-center">Status</th>
                  <th>Parent Contact</th>
                  <th>Reason / Note</th>
                  <th class="text-center">Follow-up Action</th>
                </tr>
              </thead>
              <tbody>
                ${absentees.map(s => `
                  <tr>
                    <td class="text-center"><strong>#${s.roll}</strong></td>
                    <td><strong>${s.name}</strong></td>
                    <td class="text-center"><span class="portal-badge ${s.att === 'L' ? 'badge-warning' : 'badge-danger'}">${s.att === 'L' ? 'Late Arrival' : 'Absent'}</span></td>
                    <td><a href="tel:${s.phone}">${s.phone}</a></td>
                    <td><span class="text-muted text-sm">${s.remarks}</span></td>
                    <td class="text-center"><button type="button" class="btn btn-primary btn-sm" onclick="teacherApp.showToast('Automated attendance SMS dispatched to ${s.name} parent (${s.phone})', 'success')"><i class="fa-solid fa-paper-plane"></i> Send SMS</button></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <button type="button" class="btn btn-secondary btn-sm mt-3" onclick="teacherApp.switchSubTab('attendance', 'mark')">
            <i class="fa-solid fa-arrow-left"></i> Return to Daily Register
          </button>
        </div>
      `;
      showToast(`Showing Absentee Summary (${absentees.length} records)`, 'warning');
    }
  }

  function renderExaminationsSubTab(subKey) {
    const card = document.querySelector('#view-examinations .card');
    if (!card) return;

    // Sync examinations tab strip
    const strip = document.getElementById('examinationsTabStrip');
    if (strip) {
      strip.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-sub') === subKey);
      });
    }

    let extraDiv = document.getElementById('examSubExtraView');
    const tableContainer = card.querySelector('.table-container');

    if (subKey === 'enter-marks') {
      if (extraDiv) extraDiv.style.display = 'none';
      if (tableContainer) tableContainer.style.display = 'block';
      const headerTitle = card.querySelector('.card-header-bar h3');
      if (headerTitle) headerTitle.innerHTML = '<i class="fa-solid fa-pen-to-square text-primary mr-1"></i> Mathematics Unit Test 2 &bull; Class 8A (Max Marks: 50)';
      renderMarksEntryTable();
      showToast('Loaded Marks Entry Grid with auto-grade calculation', 'info');
    } else if (subKey === 'schedule') {
      if (tableContainer) tableContainer.style.display = 'none';
      if (!extraDiv) {
        extraDiv = document.createElement('div');
        extraDiv.id = 'examSubExtraView';
        card.appendChild(extraDiv);
      }
      extraDiv.style.display = 'block';
      extraDiv.innerHTML = `
        <div class="mt-2">
          <div class="card-header-bar mb-3">
            <div>
              <h3><i class="fa-solid fa-calendar-days text-primary"></i> Assigned Examination Schedule &amp; Invigilation Duties</h3>
              <p class="text-muted text-sm mt-1">Official Term 1 Board &amp; Internal Examination Roster &bull; AP SCERT Guidelines</p>
            </div>
            <span class="portal-badge badge-primary">Term 1 2026-27</span>
          </div>

          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Exam Date &amp; Day</th>
                  <th>Shift &amp; Timings</th>
                  <th>Assigned Class &amp; Subject</th>
                  <th>Exam Hall / Room</th>
                  <th>Assigned Duty Role</th>
                  <th>Duty Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Mon, 24 Nov 2026</strong></td>
                  <td>09:30 AM - 12:30 PM</td>
                  <td><span class="portal-badge badge-primary">Class 8A</span> <strong>Mathematics Paper I</strong></td>
                  <td>Room 204 (High School Wing)</td>
                  <td><strong>Chief Invigilator</strong></td>
                  <td><span class="portal-badge badge-success"><i class="fa-solid fa-circle-check mr-1"></i>Confirmed Duty</span></td>
                </tr>
                <tr>
                  <td><strong>Wed, 26 Nov 2026</strong></td>
                  <td>09:30 AM - 12:30 PM</td>
                  <td><span class="portal-badge badge-primary">Class 9B</span> <strong>Mathematics Paper II</strong></td>
                  <td>Room 208</td>
                  <td><strong>Room Invigilator</strong></td>
                  <td><span class="portal-badge badge-success"><i class="fa-solid fa-circle-check mr-1"></i>Confirmed Duty</span></td>
                </tr>
                <tr>
                  <td><strong>Fri, 28 Nov 2026</strong></td>
                  <td>01:30 PM - 04:30 PM</td>
                  <td><span class="portal-badge badge-warning">Class 10A</span> <strong>Mathematics Practical Evaluation</strong></td>
                  <td>Computer / Math Lab B</td>
                  <td><strong>External Examiner Liaison</strong></td>
                  <td><span class="portal-badge badge-warning"><i class="fa-solid fa-clock mr-1"></i>Pending Squad Dispatch</span></td>
                </tr>
                <tr>
                  <td><strong>Mon, 01 Dec 2026</strong></td>
                  <td>09:30 AM - 12:30 PM</td>
                  <td><span class="portal-badge badge-primary">Class 7C</span> <strong>General Science</strong></td>
                  <td>Room 112</td>
                  <td><strong>Relieving Supervisor</strong></td>
                  <td><span class="portal-badge badge-success"><i class="fa-solid fa-circle-check mr-1"></i>Confirmed Duty</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
      showToast('Loaded Assigned Examination Schedule & Duties', 'info');
    } else if (subKey === 'review') {
      if (tableContainer) tableContainer.style.display = 'none';
      if (!extraDiv) {
        extraDiv = document.createElement('div');
        extraDiv.id = 'examSubExtraView';
        card.appendChild(extraDiv);
      }
      extraDiv.style.display = 'block';
      extraDiv.innerHTML = `
        <div class="mt-2">
          <div class="card-header-bar mb-3">
            <div>
              <h3><i class="fa-solid fa-clipboard-check text-primary"></i> Marks Review, Moderation &amp; Approval Status</h3>
              <p class="text-muted text-sm mt-1">Reviewer feedback from Vice Principal &amp; Exam Controller prior to report card printing.</p>
            </div>
            <button class="btn btn-primary btn-sm" onclick="teacherApp.showToast('Resubmitted marks package with resolution notes.', 'success')">
              <i class="fa-solid fa-paper-plane mr-1"></i> Resubmit for Final Approval
            </button>
          </div>

          <!-- Reviewer Feedback Notice -->
          <div class="p-3 mb-3 rounded-2 border" style="background:#f0fdf4; border-color:#bbf7d0 !important;">
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div>
                <strong style="color:#166534;"><i class="fa-solid fa-circle-check mr-1"></i> Exam Cell Moderation Verdict: Approved with Minor Verification</strong>
                <p class="text-xs text-muted mb-0 mt-1">Reviewed by <strong>Sri Navva Anand (Vice Principal)</strong> &bull; Class 8A Mathematics Unit Test 2 marks curve conforms to state grading distribution (42/42 students evaluated).</p>
              </div>
              <span class="badge" style="background:#dcfce7; color:#166534; font-weight:700; padding:6px 12px;">Stage: Executive Sign-off</span>
            </div>
          </div>

          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Class &amp; Subject</th>
                  <th>Submitted Marks</th>
                  <th>Reviewer Feedback</th>
                  <th>Correction Requests</th>
                  <th>Approval Status</th>
                  <th class="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Class 8A &bull; Mathematics</strong><br><small class="text-muted">Unit Test 2 (Max: 50)</small></td>
                  <td>42 / 42 Students</td>
                  <td><span class="text-xs" style="color:#1e293b;">"Marks entered accurately. Distinction rate is 42.9%. Good job."</span></td>
                  <td><span class="portal-badge badge-success"><i class="fa-solid fa-check mr-1"></i>0 Flags (Verified)</span></td>
                  <td><span class="portal-badge badge-success">Approved &amp; Moderated</span></td>
                  <td class="text-center"><button class="btn btn-secondary btn-sm" onclick="teacherApp.showToast('Downloaded signed moderation docket', 'success')"><i class="fa-solid fa-file-pdf"></i> Docket</button></td>
                </tr>
                <tr>
                  <td><strong>Class 9B &bull; Mathematics</strong><br><small class="text-muted">FA-1 Mid-Term (Max: 25)</small></td>
                  <td>40 / 40 Students</td>
                  <td><span class="text-xs" style="color:#1e293b;">"Roll 914 attendance discrepancy noted during exam day. Cross-check hall sheet."</span></td>
                  <td><span class="portal-badge badge-warning"><i class="fa-solid fa-triangle-exclamation mr-1"></i>1 Roll Verification</span></td>
                  <td><span class="portal-badge badge-warning">Corrections Requested</span></td>
                  <td class="text-center"><button class="btn btn-primary btn-sm" onclick="teacherApp.showToast('Opened correction ledger for Roll 914', 'info')"><i class="fa-solid fa-pen"></i> Review Roll</button></td>
                </tr>
                <tr>
                  <td><strong>Class 7C &bull; Mathematics</strong><br><small class="text-muted">Quarterly Assessment (Max: 100)</small></td>
                  <td>38 / 38 Students</td>
                  <td><span class="text-xs" style="color:#1e293b;">"Submitted on time. Awaiting final Principal seal."</span></td>
                  <td><span class="portal-badge badge-success"><i class="fa-solid fa-check mr-1"></i>0 Flags</span></td>
                  <td><span class="portal-badge badge-primary">Under Moderation</span></td>
                  <td class="text-center"><button class="btn btn-secondary btn-sm" onclick="teacherApp.showToast('Status: In queue with Principal Office', 'info')"><i class="fa-solid fa-eye"></i> View</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
      showToast('Loaded Marks Review & Moderation Feedback', 'info');
    } else if (subKey === 'grade' || subKey === 'results') {
      if (tableContainer) tableContainer.style.display = 'none';
      if (!extraDiv) {
        extraDiv = document.createElement('div');
        extraDiv.id = 'examSubExtraView';
        card.appendChild(extraDiv);
      }
      extraDiv.style.display = 'block';
      extraDiv.innerHTML = `
        <div class="mt-3">
          <div class="chart-card mb-3">
            <div class="chart-title-wrap">
              <h4><i class="fa-solid fa-chart-column text-primary"></i> Class 8A CBSE / State Grade Distribution Bar Graph</h4>
              <span class="portal-badge badge-success">42 Students Evaluated</span>
            </div>
            <div class="bar-chart-container">
              <div class="bar-chart-row">
                <div class="bar-header">
                  <span class="bar-label"><i class="fa-solid fa-medal text-emerald"></i> Grade O (90% – 100%): 45 to 50 Marks</span>
                  <span class="bar-value text-emerald">18 Students (42.9%)</span>
                </div>
                <div class="bar-track">
                  <div class="bar-fill fill-emerald" style="width: 42.9%;"></div>
                </div>
              </div>
              <div class="bar-chart-row">
                <div class="bar-header">
                  <span class="bar-label"><i class="fa-solid fa-award text-blue"></i> Grade A (80% – 89%): 40 to 44 Marks</span>
                  <span class="bar-value text-primary">10 Students (23.8%)</span>
                </div>
                <div class="bar-track">
                  <div class="bar-fill fill-blue" style="width: 23.8%;"></div>
                </div>
              </div>
              <div class="bar-chart-row">
                <div class="bar-header">
                  <span class="bar-label"><i class="fa-solid fa-circle-check" style="color: #8B5CF6;"></i> Grade B (70% – 79%): 35 to 39 Marks</span>
                  <span class="bar-value" style="color: #8B5CF6;">8 Students (19.0%)</span>
                </div>
                <div class="bar-track">
                  <div class="bar-fill fill-purple" style="width: 19.0%;"></div>
                </div>
              </div>
              <div class="bar-chart-row">
                <div class="bar-header">
                  <span class="bar-label"><i class="fa-solid fa-circle-check text-amber"></i> Grade C (60% – 69%): 30 to 34 Marks</span>
                  <span class="bar-value text-amber">4 Students (9.5%)</span>
                </div>
                <div class="bar-track">
                  <div class="bar-fill fill-amber" style="width: 9.5%;"></div>
                </div>
              </div>
              <div class="bar-chart-row">
                <div class="bar-header">
                  <span class="bar-label"><i class="fa-solid fa-triangle-exclamation text-red"></i> Grade C1 (51% – 60%): Remedial</span>
                  <span class="bar-value" style="color: #EF4444;">2 Students (4.8%)</span>
                </div>
                <div class="bar-track">
                  <div class="bar-fill fill-red" style="width: 4.8%;"></div>
                </div>
              </div>
            </div>
          </div>
          <button type="button" class="btn btn-secondary btn-sm" onclick="teacherApp.switchSubTab('examinations', 'enter-marks')">
            <i class="fa-solid fa-arrow-left"></i> Return to Marks Entry
          </button>
        </div>
      `;
      showToast('Loaded Grade Distribution Bar Graph', 'info');
    } else if (subKey === 'create') {
      showToast('Assessment form ready for new examination entry', 'info');
    }
  }

  function renderAssignmentsSubTab(subKey) {
    const area = document.getElementById('assignmentsContentArea');
    if (!area) return;

    // Sync assignments tab strip
    const strip = document.getElementById('assignmentsTabStrip');
    if (strip) {
      strip.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-sub') === subKey);
      });
    }

    if (subKey === 'submissions') {
      area.innerHTML = `
        <div class="card p-4">
          <div class="card-header-bar mb-3">
            <div>
              <h3><i class="fa-solid fa-inbox text-primary"></i> Student Submissions &amp; Evaluation Desk</h3>
              <p class="text-muted text-sm mt-1">Review student submissions, identify late work, provide feedback, and record grading marks.</p>
            </div>
            <div class="d-flex gap-2">
              <span class="portal-badge badge-primary">Class 8A &bull; Mathematics</span>
              <button class="btn btn-primary btn-sm" onclick="teacherApp.showToast('Grading marks and feedback successfully saved &amp; synchronized.', 'success')">
                <i class="fa-solid fa-floppy-disk mr-1"></i> Save All Grades
              </button>
            </div>
          </div>

          <div class="row g-3 mb-3">
            <div class="col-md-3">
              <div class="p-3 bg-light rounded text-center border">
                <span class="text-muted text-xs text-uppercase font-weight-bold">Total Expected</span>
                <h4 class="mt-1 mb-0 text-dark">42 Students</h4>
              </div>
            </div>
            <div class="col-md-3">
              <div class="p-3 bg-light rounded text-center border">
                <span class="text-muted text-xs text-uppercase font-weight-bold">Submitted</span>
                <h4 class="mt-1 mb-0 text-emerald">38 (90.5%)</h4>
              </div>
            </div>
            <div class="col-md-3">
              <div class="p-3 bg-light rounded text-center border">
                <span class="text-muted text-xs text-uppercase font-weight-bold">Late Submissions</span>
                <h4 class="mt-1 mb-0 text-amber">3 Flagged</h4>
              </div>
            </div>
            <div class="col-md-3">
              <div class="p-3 bg-light rounded text-center border">
                <span class="text-muted text-xs text-uppercase font-weight-bold">Graded Work</span>
                <h4 class="mt-1 mb-0 text-primary">34 Completed</h4>
              </div>
            </div>
          </div>

          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 80px;" class="text-center">Roll #</th>
                  <th>Student Name</th>
                  <th>Assignment Title</th>
                  <th>Submitted At</th>
                  <th>Submission Status</th>
                  <th style="width: 200px;">Teacher Feedback</th>
                  <th style="width: 120px;" class="text-center">Grade / Marks</th>
                  <th class="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="text-center font-weight-bold">#801</td>
                  <td><strong>A. Aarav</strong><br><small class="text-muted">Class 8A</small></td>
                  <td>Linear Equations Ex 2.3 Q1-10</td>
                  <td>Today, 02:15 PM</td>
                  <td><span class="portal-badge badge-success"><i class="fa-solid fa-circle-check mr-1"></i>On Time (PDF)</span></td>
                  <td><input type="text" class="form-control form-control-sm" value="Neat working and correct substitution steps." style="font-size:0.8rem;"></td>
                  <td class="text-center"><input type="text" class="form-control form-control-sm text-center font-weight-bold" value="10 / 10" style="max-width:80px; margin:auto; color:#166534;"></td>
                  <td class="text-center"><button class="btn btn-secondary btn-sm" onclick="teacherApp.showToast('Downloaded Aarav notebook scan', 'info')"><i class="fa-solid fa-file-pdf"></i> View</button></td>
                </tr>
                <tr>
                  <td class="text-center font-weight-bold">#802</td>
                  <td><strong>B. Bhavana</strong><br><small class="text-muted">Class 8A</small></td>
                  <td>Linear Equations Ex 2.3 Q1-10</td>
                  <td>Today, 03:40 PM</td>
                  <td><span class="portal-badge badge-success"><i class="fa-solid fa-circle-check mr-1"></i>On Time (PDF)</span></td>
                  <td><input type="text" class="form-control form-control-sm" value="Minor error in Question 7 transpose sign." style="font-size:0.8rem;"></td>
                  <td class="text-center"><input type="text" class="form-control form-control-sm text-center font-weight-bold" value="9 / 10" style="max-width:80px; margin:auto; color:#166534;"></td>
                  <td class="text-center"><button class="btn btn-secondary btn-sm" onclick="teacherApp.showToast('Downloaded Bhavana notebook scan', 'info')"><i class="fa-solid fa-file-pdf"></i> View</button></td>
                </tr>
                <tr>
                  <td class="text-center font-weight-bold">#804</td>
                  <td><strong>D. Divya</strong><br><small class="text-muted">Class 8A</small></td>
                  <td>Linear Equations Ex 2.3 Q1-10</td>
                  <td>Today, 05:45 PM</td>
                  <td><span class="portal-badge badge-warning"><i class="fa-solid fa-clock mr-1"></i>Late (45m)</span></td>
                  <td><input type="text" class="form-control form-control-sm" value="Submitted after 5 PM deadline. Verified." style="font-size:0.8rem;"></td>
                  <td class="text-center"><input type="text" class="form-control form-control-sm text-center font-weight-bold" value="8 / 10" style="max-width:80px; margin:auto; color:#b45309;"></td>
                  <td class="text-center"><button class="btn btn-secondary btn-sm" onclick="teacherApp.showToast('Downloaded Divya notebook scan', 'info')"><i class="fa-solid fa-file-pdf"></i> View</button></td>
                </tr>
                <tr>
                  <td class="text-center font-weight-bold">#806</td>
                  <td><strong>F. Farhan</strong><br><small class="text-muted">Class 8A</small></td>
                  <td>Linear Equations Ex 2.3 Q1-10</td>
                  <td>Yesterday, 07:10 PM</td>
                  <td><span class="portal-badge badge-warning"><i class="fa-solid fa-triangle-exclamation mr-1"></i>Late (1 Day)</span></td>
                  <td><input type="text" class="form-control form-control-sm" value="Incomplete Q9 and Q10. Resubmit correction." style="font-size:0.8rem;"></td>
                  <td class="text-center"><input type="text" class="form-control form-control-sm text-center font-weight-bold" value="6 / 10" style="max-width:80px; margin:auto; color:#dc2626;"></td>
                  <td class="text-center"><button class="btn btn-secondary btn-sm" onclick="teacherApp.showToast('Downloaded Farhan notebook scan', 'info')"><i class="fa-solid fa-file-pdf"></i> View</button></td>
                </tr>
                <tr>
                  <td class="text-center font-weight-bold">#810</td>
                  <td><strong>K. Kiran</strong><br><small class="text-muted">Class 8A</small></td>
                  <td>Linear Equations Ex 2.3 Q1-10</td>
                  <td>--</td>
                  <td><span class="portal-badge badge-danger"><i class="fa-solid fa-circle-xmark mr-1"></i>Pending Submission</span></td>
                  <td><input type="text" class="form-control form-control-sm" placeholder="Reminder sent to parent" style="font-size:0.8rem;"></td>
                  <td class="text-center"><span class="text-muted text-xs font-weight-bold">Awaiting Work</span></td>
                  <td class="text-center"><button class="btn btn-primary btn-sm" onclick="teacherApp.showToast('Dispatched homework reminder SMS to Kiran parent', 'info')"><i class="fa-solid fa-bell"></i> Remind</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
      showToast('Loaded Student Submissions, Late Tracking & Grading Desk', 'info');
    } else {
      // Default: Create / Manage Assignments Overview
      area.innerHTML = `
        <div class="row g-3">
          <div class="col-md-4">
            <div class="card p-3 h-100" style="border-left: 4px solid var(--color-primary);">
              <div class="d-flex justify-content-between align-items-center">
                <span class="portal-badge badge-primary">Class 8A • Homework</span>
                <span class="text-danger text-sm font-weight-bold">Due Today (05:00 PM)</span>
              </div>
              <h4 class="mt-2 mb-1" style="font-size: 1rem;">Ex 2.3 Linear Equations Questions 1–10</h4>
              <p class="text-muted text-xs">Solve step-by-step in the mathematics classwork notebook. Bring for morning desk correction.</p>
              <div class="mt-3 pt-2 border-top d-flex justify-content-between align-items-center text-xs">
                <span>Submissions: <strong>38 / 42 (90%)</strong></span>
                <button class="btn btn-secondary btn-sm" onclick="teacherApp.switchSubTab('assignments', 'submissions')">Check Submissions</button>
              </div>
            </div>
          </div>

          <div class="col-md-4">
            <div class="card p-3 h-100" style="border-left: 4px solid #06B6D4;">
              <div class="d-flex justify-content-between align-items-center">
                <span class="portal-badge badge-primary" style="background: rgba(6,182,212,0.15); color: #0891B2;">Class 9B • Project</span>
                <span class="text-muted text-sm font-weight-bold">Due Tomorrow</span>
              </div>
              <h4 class="mt-2 mb-1" style="font-size: 1rem;">Polynomials Factorization Practice Sheet</h4>
              <p class="text-muted text-xs">Complete 15 factorization problems on splitting middle terms and applying factor theorem.</p>
              <div class="mt-3 pt-2 border-top d-flex justify-content-between align-items-center text-xs">
                <span>Submissions: <strong>26 / 40 (65%)</strong></span>
                <button class="btn btn-secondary btn-sm" onclick="teacherApp.switchSubTab('assignments', 'submissions')">Check Submissions</button>
              </div>
            </div>
          </div>

          <div class="col-md-4">
            <div class="card p-3 h-100" style="border-left: 4px solid #10B981;">
              <div class="d-flex justify-content-between align-items-center">
                <span class="portal-badge badge-success">Class 7C • Drill</span>
                <span class="text-muted text-sm font-weight-bold">Sept 22, 2026</span>
              </div>
              <h4 class="mt-2 mb-1" style="font-size: 1rem;">Fractions Reciprocal &amp; Division Drill</h4>
              <p class="text-muted text-xs">Workbook exercise 3B: Practice mental fraction conversion and area model representations.</p>
              <div class="mt-3 pt-2 border-top d-flex justify-content-between align-items-center text-xs">
                <span>Submissions: <strong>35 / 38 (92%)</strong></span>
                <button class="btn btn-secondary btn-sm" onclick="teacherApp.switchSubTab('assignments', 'submissions')">Check Submissions</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Downloadable Study Guides Section -->
        <div class="card p-4 mt-4">
          <div class="card-header-bar">
            <h3><i class="fa-solid fa-file-pdf text-danger"></i> Class Study Material Repository</h3>
            <button class="btn btn-secondary btn-sm" onclick="teacherApp.showToast('Uploaded new syllabus notes PDF', 'success')">
              <i class="fa-solid fa-cloud-arrow-up"></i> Upload PDF to Class
            </button>
          </div>
          <div class="table-container mt-3">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Document Name</th>
                  <th>Target Class</th>
                  <th>Upload Date</th>
                  <th>File Size</th>
                  <th class="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Chapter 2: Linear Equations Reference Notes &amp; Formulae</strong></td>
                  <td>Class 8A</td>
                  <td>Sept 15, 2026</td>
                  <td>2.4 MB</td>
                  <td class="text-center"><button class="btn btn-secondary btn-sm" onclick="teacherApp.showToast('Downloaded PDF notes', 'success')"><i class="fa-solid fa-download"></i></button></td>
                </tr>
                <tr>
                  <td><strong>Polynomials Factor Theorem Solved Examples Sheet</strong></td>
                  <td>Class 9B</td>
                  <td>Sept 12, 2026</td>
                  <td>3.1 MB</td>
                  <td class="text-center"><button class="btn btn-secondary btn-sm" onclick="teacherApp.showToast('Downloaded PDF notes', 'success')"><i class="fa-solid fa-download"></i></button></td>
                </tr>
                <tr>
                  <td><strong>Fractions &amp; Decimals Self-Practice Drill 3B</strong></td>
                  <td>Class 7C</td>
                  <td>Sept 08, 2026</td>
                  <td>1.8 MB</td>
                  <td class="text-center"><button class="btn btn-secondary btn-sm" onclick="teacherApp.showToast('Downloaded PDF notes', 'success')"><i class="fa-solid fa-download"></i></button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
      showToast('Loaded Homework & Assignment Creator', 'info');
    }
  }

  function renderLeaveSubTab(subKey) {
    const area = document.getElementById('leaveContentArea');
    if (!area) return;

    // Sync tab strip
    const strip = document.getElementById('leaveTabStrip');
    if (strip) {
      strip.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-sub') === subKey);
      });
    }

    if (subKey === 'apply') {
      area.innerHTML = `
        <div class="row g-3">
          <div class="col-lg-8">
            <div class="card p-4">
              <div class="card-header-bar mb-3">
                <div>
                  <h3><i class="fa-solid fa-file-pen text-primary"></i> Faculty Leave Application Form</h3>
                  <p class="text-muted text-sm mt-1">Submit request for formal approval by Principal Dr. M. R. Krishna.</p>
                </div>
                <span class="portal-badge badge-primary">Term 1 2026-27</span>
              </div>

              <form onsubmit="event.preventDefault(); teacherApp.showToast('Leave application submitted to Principal Office for approval', 'success'); teacherApp.switchSubTab('leave', 'history');">
                <div class="row g-3 mb-3">
                  <div class="col-md-6">
                    <label class="form-label" style="font-weight:600; font-size:0.85rem;">Leave Type *</label>
                    <select class="form-control" id="formLeaveType" required>
                      <option value="Casual Leave (CL)">Casual Leave (CL) — 8 Days Remaining</option>
                      <option value="Medical Leave (ML)">Medical Leave (ML) — 10 Days Remaining</option>
                      <option value="On Duty (OD)">On Duty (OD) — Institutional Duty</option>
                      <option value="Earned Leave (EL)">Earned Leave (EL)</option>
                    </select>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label" style="font-weight:600; font-size:0.85rem;">Number of Days *</label>
                    <input type="number" class="form-control" min="0.5" step="0.5" value="1" required>
                  </div>
                </div>

                <div class="row g-3 mb-3">
                  <div class="col-md-6">
                    <label class="form-label" style="font-weight:600; font-size:0.85rem;">From Date *</label>
                    <input type="date" class="form-control" value="2026-11-02" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label" style="font-weight:600; font-size:0.85rem;">To Date *</label>
                    <input type="date" class="form-control" value="2026-11-02" required>
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label" style="font-weight:600; font-size:0.85rem;">Substitute Arrangement *</label>
                  <select class="form-control" required>
                    <option value="Sri K. Raghunath">Sri K. Raghunath (Secondary Mathematics) — Confirmed</option>
                    <option value="Smt. P. Sunitha">Smt. P. Sunitha (High School Science) — Confirmed</option>
                    <option value="Sri G. Srinivas">Sri G. Srinivas (Social Studies) — Available</option>
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label" style="font-weight:600; font-size:0.85rem;">Reason for Leave *</label>
                  <textarea class="form-control" rows="3" placeholder="Provide reason for leave application..." required>Attending family wedding ceremony in Vijayawada. Class 8A periods handed over to Sri K. Raghunath.</textarea>
                </div>

                <div class="mb-4">
                  <label class="form-label" style="font-weight:600; font-size:0.85rem;">Supporting Document (Optional for CL, Mandatory for ML)</label>
                  <input type="file" class="form-control">
                  <small class="text-muted">Accepted formats: PDF, JPG, PNG (Max size: 5MB)</small>
                </div>

                <div class="d-flex gap-2">
                  <button type="submit" class="btn btn-primary">
                    <i class="fa-solid fa-paper-plane mr-1"></i> Submit Leave Application
                  </button>
                  <button type="button" class="btn btn-secondary" onclick="teacherApp.switchSubTab('leave', 'history')">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="card p-3 mb-3">
              <h4><i class="fa-solid fa-wallet text-emerald mr-1"></i> Leave Entitlement Balance</h4>
              <div class="mt-3">
                <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                  <span>Casual Leaves (CL)</span>
                  <strong class="text-primary">8 / 12 Days</strong>
                </div>
                <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                  <span>Medical Leaves (ML)</span>
                  <strong class="text-emerald">10 / 10 Days</strong>
                </div>
                <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
                  <span>On Duty (OD)</span>
                  <strong>2 Days Used</strong>
                </div>
                <div class="d-flex justify-content-between align-items-center py-2">
                  <span>Loss of Pay (LOP)</span>
                  <strong class="text-muted">0 Days</strong>
                </div>
              </div>
            </div>

            <div class="card p-3" style="background:#f8fafc; border:1px dashed #cbd5e1;">
              <h5 style="font-size:0.9rem; color:#475569;"><i class="fa-solid fa-circle-info text-primary mr-1"></i> Leave Approval Policy</h5>
              <p class="text-xs text-muted mb-0 mt-2" style="line-height:1.5;">
                Prior sanction from the Principal is mandatory for casual leave exceeding 2 consecutive days. Medical leaves beyond 3 days require a registered medical practitioner certificate.
              </p>
            </div>
          </div>
        </div>
      `;
      showToast('Loaded Leave Application Form', 'info');
    } else {
      // Default: Leave History
      area.innerHTML = `
        <div class="card p-4">
          <div class="card-header-bar mb-3">
            <div>
              <h3><i class="fa-solid fa-clock-rotate-left text-primary"></i> Leave Applications &amp; Decision History</h3>
              <p class="text-muted text-sm mt-1">Official records of submitted, approved, rejected, and cancelled faculty leave requests.</p>
            </div>
            <button class="btn btn-primary btn-sm" onclick="teacherApp.switchSubTab('leave', 'apply')">
              <i class="fa-solid fa-plus mr-1"></i> New Leave Request
            </button>
          </div>

          <div class="metrics-quad mb-3">
            <div class="metric-card">
              <span class="metric-label">Casual Leaves (CL)</span>
              <div class="metric-value text-primary">8 / 12</div>
              <span class="metric-sub">Remaining Balance</span>
            </div>
            <div class="metric-card">
              <span class="metric-label">Medical Leaves (ML)</span>
              <div class="metric-value text-emerald">10 / 10</div>
              <span class="metric-sub">Fully Intact</span>
            </div>
            <div class="metric-card">
              <span class="metric-label">On Duty (OD)</span>
              <div class="metric-value">2 Days</div>
              <span class="metric-sub">SCERT Workshop</span>
            </div>
            <div class="metric-card">
              <span class="metric-label">Approval Rate</span>
              <div class="metric-value text-emerald">100%</div>
              <span class="metric-sub">4 of 4 Approved</span>
            </div>
          </div>

          <div class="table-container mt-2">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Application ID</th>
                  <th>Leave Type</th>
                  <th>Leave Dates</th>
                  <th>Days</th>
                  <th>Substitute Arranged</th>
                  <th>Reason</th>
                  <th>Approval Status</th>
                  <th class="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>LV-2026-041</strong></td>
                  <td><span class="portal-badge badge-primary">Casual Leave</span></td>
                  <td>Oct 12, 2026</td>
                  <td>1 Day</td>
                  <td>Sri K. Raghunath</td>
                  <td>Personal work at Sub-Registrar office</td>
                  <td><span class="portal-badge badge-success"><i class="fa-solid fa-check mr-1"></i>Approved by Principal</span></td>
                  <td class="text-center"><button class="btn btn-secondary btn-sm" onclick="teacherApp.showToast('Downloaded Leave Sanction Slip', 'info')"><i class="fa-solid fa-print"></i></button></td>
                </tr>
                <tr>
                  <td><strong>LV-2026-028</strong></td>
                  <td><span class="portal-badge badge-info" style="background:#e0f2fe; color:#0369a1;">On Duty (OD)</span></td>
                  <td>Sept 15 – Sept 16, 2026</td>
                  <td>2 Days</td>
                  <td>Smt. P. Sunitha</td>
                  <td>State Level Mathematics Pedagogy Seminar</td>
                  <td><span class="portal-badge badge-success"><i class="fa-solid fa-check mr-1"></i>Sanctioned OD</span></td>
                  <td class="text-center"><button class="btn btn-secondary btn-sm" onclick="teacherApp.showToast('Downloaded Leave Sanction Slip', 'info')"><i class="fa-solid fa-print"></i></button></td>
                </tr>
                <tr>
                  <td><strong>LV-2026-014</strong></td>
                  <td><span class="portal-badge badge-primary">Casual Leave</span></td>
                  <td>Aug 22, 2026</td>
                  <td>1 Day</td>
                  <td>Sri G. Srinivas</td>
                  <td>Family function attendance</td>
                  <td><span class="portal-badge badge-success"><i class="fa-solid fa-check mr-1"></i>Approved by Principal</span></td>
                  <td class="text-center"><button class="btn btn-secondary btn-sm" onclick="teacherApp.showToast('Downloaded Leave Sanction Slip', 'info')"><i class="fa-solid fa-print"></i></button></td>
                </tr>
                <tr>
                  <td><strong>LV-2026-009</strong></td>
                  <td><span class="portal-badge badge-warning">Medical Leave</span></td>
                  <td>Jul 10, 2026</td>
                  <td>0.5 Day</td>
                  <td>Sri K. Raghunath</td>
                  <td>Doctor consultation (Afternoon session)</td>
                  <td><span class="portal-badge badge-success"><i class="fa-solid fa-check mr-1"></i>Approved by Principal</span></td>
                  <td class="text-center"><button class="btn btn-secondary btn-sm" onclick="teacherApp.showToast('Downloaded Leave Sanction Slip', 'info')"><i class="fa-solid fa-print"></i></button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      `;
      showToast('Loaded Leave History & Decision Ledger', 'info');
    }
  }

  function renderTimetableSubTab(subKey) {
    showToast(`Viewing timetable: ${subKey === 'class' ? 'Class 8A All Subjects' : 'Ms. Anjali Schedule'}`, 'info');
  }

  
  // (Duplicate renderLeaveSubTab removed - see primary renderer above)

  function renderReportsSubTab(subKey) {
    showToast('Loaded Class 8A Academic Performance Reports', 'info');
  }

  function renderCommunicationSubTab(subKey) {
    if (subKey === 'parent-messages') {
      renderParentMessages();
      showToast('Showing direct messages from parents', 'info');
    } else if (subKey === 'class-announcements') {
      showToast('Showing Class 8A announcements and circulars', 'info');
    } else if (subKey === 'notifications') {
      showToast('Showing official school administrative notices', 'info');
    }
  }

  function switchClassTab(classKey) {
    const overviewEl = document.getElementById('classOverviewContent');
    if (!overviewEl) return;

    // Highlight active button in tab strip
    const tabStrip = document.querySelector('#view-my-classes .tab-strip');
    if (tabStrip) {
      tabStrip.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.getAttribute('onclick')?.includes(`'${classKey}'`)) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    const cls = state.classes.find(c => c.id === classKey) || state.classes[0];
    if (!cls) return;

    const classCode = cls.code || cls.name.replace('Class ', '').split(' ')[0];
    const classStudents = state.students.filter(s => s.class === classCode);

    overviewEl.innerHTML = `
      <div class="card p-4 mb-4" style="padding: 1.5rem; border: 1px solid var(--color-border); border-radius: var(--radius-lg); box-shadow: 0 4px 12px rgba(0,0,0,0.03); box-sizing: border-box;">
        <div class="card-header-bar" style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <h3 style="margin: 0; font-size: 1.35rem; color: var(--color-text-dark);"><i class="fa-solid fa-shapes text-primary"></i> ${cls.name} &mdash; Section Dashboard</h3>
              <span class="portal-badge ${cls.isClassTeacher ? 'badge-success' : 'badge-primary'}" style="font-size: 0.82rem; padding: 4px 10px;">
                ${cls.isClassTeacher ? '⭐ Class Teacher Assigned' : '📘 Subject Teacher'}
              </span>
            </div>
            <p class="text-muted text-sm mt-1" style="margin-bottom: 0;">
              <strong>Subject:</strong> ${cls.subject} &bull; 
              <strong>Classroom:</strong> ${cls.room} &bull; 
              <strong>Schedule:</strong> ${cls.timing}
            </p>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-primary btn-sm" onclick="teacherApp.navigateTo('students'); teacherApp.selectStudentClass('${classCode}');">
              <i class="fa-solid fa-user-graduate"></i> View Students List
            </button>
            <button class="btn btn-secondary btn-sm" onclick="teacherApp.openModal('createHomeworkModal')">
              <i class="fa-solid fa-file-pen"></i> Assign Homework
            </button>
          </div>
        </div>

        <!-- Class Details Metrics Bar -->
        <div class="metrics-quad mt-3" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem;">
          <div class="metric-card" style="padding: 1rem; background: var(--color-bg-subtle); border-radius: 8px;">
            <span class="metric-label" style="font-size: 0.78rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 600;">Total Enrolled</span>
            <div class="metric-value" style="font-size: 1.5rem; font-weight: 800; color: var(--color-text-dark); margin: 4px 0;">${classStudents.length} Students</div>
            <span class="metric-sub" style="font-size: 0.78rem; color: #64748b;">Active Section Roster</span>
          </div>
          <div class="metric-card" style="padding: 1rem; background: var(--color-bg-subtle); border-radius: 8px;">
            <span class="metric-label" style="font-size: 0.78rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 600;">Today's Attendance</span>
            <div class="metric-value text-emerald" style="font-size: 1.5rem; font-weight: 800; margin: 4px 0;">
              ${((classStudents.filter(s => s.att === 'P').length / (classStudents.length || 1)) * 100).toFixed(1)}%
            </div>
            <span class="metric-sub" style="font-size: 0.78rem; color: #059669;">
              ${classStudents.filter(s => s.att === 'P').length} Present &bull; ${classStudents.filter(s => s.att === 'A').length} Absent
            </span>
          </div>
          <div class="metric-card" style="padding: 1rem; background: var(--color-bg-subtle); border-radius: 8px;">
            <span class="metric-label" style="font-size: 0.78rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 600;">Subject Average</span>
            <div class="metric-value text-primary" style="font-size: 1.5rem; font-weight: 800; margin: 4px 0;">${cls.avgScore}</div>
            <span class="metric-sub" style="font-size: 0.78rem; color: #059669;">Top: ${cls.topper}</span>
          </div>
          <div class="metric-card" style="padding: 1rem; background: var(--color-bg-subtle); border-radius: 8px;">
            <span class="metric-label" style="font-size: 0.78rem; text-transform: uppercase; color: var(--color-text-muted); font-weight: 600;">Curriculum Progress</span>
            <div class="metric-value text-amber" style="font-size: 1.5rem; font-weight: 800; margin: 4px 0;">86%</div>
            <span class="metric-sub" style="font-size: 0.78rem; color: #d97706;">Term 1 Syllabus Completed</span>
          </div>
        </div>
      </div>

      <!-- Class Students Details Table -->
      <div class="card p-4" style="padding: 1.5rem; box-sizing: border-box;">
        <div class="card-header-bar mb-3" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div>
            <h4 style="margin: 0; font-size: 1.15rem; color: var(--color-text-dark);">
              <i class="fa-solid fa-user-graduate text-primary"></i> ${cls.name} &mdash; Enrolled Student Details (${classStudents.length} Students)
            </h4>
            <p class="text-muted text-xs mt-1">Complete individual student credentials, attendance record, and parent contact details.</p>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="teacherApp.navigateTo('students'); teacherApp.selectStudentClass('${classCode}');">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> Open in Student Roster
          </button>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th class="text-center" style="width: 80px;">Roll No</th>
                <th>Student Name</th>
                <th class="text-center" style="width: 100px;">Class</th>
                <th>Parent Phone</th>
                <th class="text-center" style="width: 110px;">Attendance</th>
                <th class="text-center" style="width: 110px;">Maths Score</th>
                <th class="text-center" style="width: 90px;">Grade</th>
                <th class="text-center" style="width: 100px;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${classStudents.map(s => {
                const grade = s.marks >= 45 ? 'O' : (s.marks >= 40 ? 'A' : (s.marks >= 35 ? 'B' : (s.marks >= 30 ? 'C' : (s.marks >= 20 ? 'D' : 'E'))));
                const attPct = s.att === 'P' ? '96%' : (s.att === 'L' ? '91%' : '86%');
                return `
                  <tr>
                    <td class="text-center"><strong>#${s.roll}</strong></td>
                    <td><strong>${s.name}</strong></td>
                    <td class="text-center"><span class="portal-badge badge-primary">${cls.name}</span></td>
                    <td><a href="tel:${s.phone}" style="color: var(--color-primary); text-decoration: none;"><i class="fa-solid fa-phone text-xs"></i> ${s.phone}</a></td>
                    <td class="text-center">
                      <span class="portal-badge ${s.att === 'P' ? 'badge-success' : (s.att === 'L' ? 'badge-warning' : 'badge-danger')}">
                        ${attPct}
                      </span>
                    </td>
                    <td class="text-center"><strong>${s.marks} / 50</strong></td>
                    <td class="text-center"><span class="portal-badge ${(grade === 'O' || grade === 'A') ? 'badge-success' : ((grade === 'B' || grade === 'C') ? 'badge-primary' : (grade === 'D' ? 'badge-warning' : 'badge-danger'))}">${grade}</span></td>
                    <td class="text-center">
                      <button type="button" class="btn btn-secondary btn-sm" onclick="teacherApp.viewStudentDossier(${s.roll})" title="View Student Dossier">
                        <i class="fa-regular fa-id-badge"></i> Dossier
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    showToast(`Loaded ${cls.name} Class & Student Details (${classStudents.length} Students)`, 'info');
  }

  function renderAll() {
    renderTasks();
    filterStudentList();
    renderAttendanceMarkingTable();
    renderMarksEntryTable();
    renderHomeworkFeed();
    renderParentMessages();
    renderLeaveHistory();
    switchClassTab('8a');
  }

  function renderTasks() {
    const container = document.getElementById('tasksContainer');
    if (!container) return;

    container.innerHTML = state.pendingTasks.map(task => `
      <div class="task-item ${task.done ? 'opacity-50' : ''}" onclick="teacherApp.toggleTask(${task.id})">
        <input type="checkbox" class="task-checkbox" ${task.done ? 'checked' : ''} onclick="event.stopPropagation(); teacherApp.toggleTask(${task.id})">
        <div class="task-content">
          <div class="task-title" style="${task.done ? 'text-decoration: line-through;' : ''}">${task.title}</div>
          <div class="task-meta">${task.meta}</div>
        </div>
        <span class="task-badge ${task.badge}">${task.badgeText}</span>
      </div>
    `).join('');

    const openCount = state.pendingTasks.filter(t => !t.done).length;
    const badge1 = document.getElementById('pendingTasksCount');
    const badge2 = document.getElementById('taskBadgeCount');
    if (badge1) badge1.textContent = `${openCount} Tasks`;
    if (badge2) badge2.textContent = `${openCount} Tasks`;
  }

  function toggleTask(id) {
    const task = state.pendingTasks.find(t => t.id === id);
    if (task) {
      task.done = !task.done; renderTasks(); renderFullTasksView();
      showToast(task.done ? `Completed: "${task.title}"` : `Reopened: "${task.title}"`, 'success');
    }
  }

    function deduplicateTeacherStudents(arr) {
    if (!Array.isArray(arr)) return [];
    const seenRoll = new Set();
    const result = [];
    for (let i = 0; i < arr.length; i++) {
      const s = arr[i];
      if (!s) continue;
      const key = `${s.class || ''}_${s.roll || ''}`;
      if (seenRoll.has(key)) continue;
      seenRoll.add(key);
      result.push(s);
    }
    return result;
  }

  function renderStudentsList(list) {
    list = deduplicateTeacherStudents(list);
    const tbody = document.getElementById('teacherStudentsTableBody');
    const countBadge = document.getElementById('studentRosterCountBadge');
    if (countBadge) {
      countBadge.textContent = `${list.length} Students`;
    }
    if (!tbody) return;

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center p-4 text-muted">No student records found matching this section.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(s => {
      const grade = s.marks >= 45 ? 'O' : (s.marks >= 40 ? 'A' : (s.marks >= 35 ? 'B' : (s.marks >= 30 ? 'C' : (s.marks >= 20 ? 'D' : 'E'))));
      const badgeClass = (grade === 'O' || grade === 'A') ? 'badge-success' : ((grade === 'B' || grade === 'C') ? 'badge-primary' : (grade === 'D' ? 'badge-warning' : 'badge-danger'));
      const attPct = s.att === 'P' ? '96%' : (s.att === 'L' ? '91%' : '86%');
      const cls = state.classes.find(c => c.code === s.class || c.id === s.class.toLowerCase());
      const isLeadClassTeacher = cls ? !!cls.isClassTeacher : false;

      return `
        <tr>
          <td class="text-center"><strong>#${s.roll}</strong></td>
          <td><strong>${s.name}</strong></td>
          <td class="text-center"><span class="portal-badge badge-primary">Class ${s.class}</span></td>
          <td><a href="tel:${s.phone}" style="color: var(--color-primary); text-decoration: none;"><i class="fa-solid fa-phone text-xs"></i> ${s.phone}</a></td>
          <td class="text-center">
            <span class="portal-badge ${s.att === 'P' ? 'badge-success' : (s.att === 'L' ? 'badge-warning' : 'badge-danger')}">
              ${attPct}
            </span>
          </td>
          <td class="text-center"><strong>${s.marks} / 50</strong> (${(s.marks * 2)}%)</td>
          <td class="text-center"><span class="portal-badge ${badgeClass}">${grade}</span></td>
          <td class="text-center">
            <div style="display: inline-flex; gap: 4px; align-items: center; justify-content: center;">
              <button type="button" class="btn btn-secondary btn-sm" onclick="teacherApp.viewStudentDossier(${s.roll})" title="View Full Dossier">
                <i class="fa-regular fa-id-badge"></i> Dossier
              </button>
              ${isLeadClassTeacher ? `
                <button type="button" class="btn btn-sm btn-outline-danger" onclick="teacherApp.promptWithdrawStudent(${s.roll}, '${s.name.replace(/'/g, "\\'")}', '${s.class}')" title="Class Teacher Authority: Withdraw Student from School Roster">
                  <i class="fa-solid fa-user-xmark"></i> Withdraw
                </button>
              ` : `
                <button type="button" class="btn btn-sm btn-outline-secondary" onclick="teacherApp.notifyNonClassTeacherAttempt('${s.name.replace(/'/g, "\\'")}', '${s.class}')" style="opacity:0.6; cursor:not-allowed;" title="Action Restricted: Only designated Class Teacher of Class ${s.class} can withdraw student">
                  <i class="fa-solid fa-lock"></i>
                </button>
              `}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  
  function selectStudentClass(classCode) {
    const select = document.getElementById('studentClassFilterSelect');
    if (select) select.value = classCode;

    // Update active pill
    document.querySelectorAll('.btn-class-pill').forEach(btn => {
      if (btn.id === 'btnClassPill-' + classCode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    renderClassInfoBanner(classCode);
    filterStudentList();
  }

  function renderClassInfoBanner(classCode) {
    const banner = document.getElementById('studentClassInfoBanner');
    if (!banner) return;

    if (classCode === 'ALL') {
      banner.innerHTML = `
        <div class="class-all-banner">
          <div>
            <div style="font-size: 1.15rem; font-weight: 700; display: flex; align-items: center; gap: 8px;">
              <i class="fa-solid fa-chalkboard-user text-amber"></i> All Assigned Teaching Classes (Combined Roster)
            </div>
            <div style="font-size: 0.84rem; opacity: 0.9; margin-top: 4px;">
              Faculty: Ms. Anjali &bull; Total 4 Sections: Class 8A (Class Teacher), Class 9B (Maths), Class 7C (Maths), Class 10A (Remedial)
            </div>
          </div>
          <div style="display: flex; gap: 20px;">
            <div style="text-align: right;">
              <div style="font-size: 0.72rem; opacity: 0.85; text-transform: uppercase;">Total Students</div>
              <div style="font-size: 1.35rem; font-weight: 800; color: #ffffff;">${state.students.length} Students</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 0.72rem; opacity: 0.85; text-transform: uppercase;">Average Attendance</div>
              <div style="font-size: 1.35rem; font-weight: 800; color: #a7f3d0;">95.4%</div>
            </div>
          </div>
        </div>
      `;
      return;
    }

    const cls = state.classes.find(c => c.code === classCode || c.name.includes(classCode)) || state.classes[0];
    const classStudents = state.students.filter(s => s.class === classCode);
    const presentCount = classStudents.filter(s => s.att === 'P').length;
    const absentCount = classStudents.filter(s => s.att === 'A').length;
    const attPct = classStudents.length ? ((presentCount / classStudents.length) * 100).toFixed(1) : '95.0';

    banner.innerHTML = `
      <div class="class-info-card">
        <div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <h3>
              <i class="fa-solid fa-graduation-cap text-primary"></i> ${cls.name} &mdash; Class Details &amp; Active Roster
            </h3>
            <span class="portal-badge ${cls.isClassTeacher ? 'badge-success' : 'badge-primary'}" style="font-size: 0.78rem;">
              ${cls.isClassTeacher ? '⭐ Class Teacher Section' : '📘 Subject Class'}
            </span>
          </div>
          <div class="class-subtext">
            <span><i class="fa-solid fa-door-open"></i> ${cls.room}</span> &bull; 
            <span><i class="fa-regular fa-clock"></i> ${cls.timing}</span> &bull; 
            <span><i class="fa-solid fa-book"></i> ${cls.subject}</span> &bull; 
            <span><i class="fa-solid fa-trophy text-amber"></i> Top Scorer: <strong>${cls.topper}</strong></span>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 20px;">
          <div style="text-align: right;">
            <div style="font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 600;">Enrolled Strength</div>
            <div class="class-metric-val">${classStudents.length} Students</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase; font-weight: 600;">Today's Attendance</div>
            <div style="font-size: 1.25rem; font-weight: 800; color: #10b981;">${attPct}% (${presentCount} Present, ${absentCount} Absent)</div>
          </div>
        </div>
      </div>
    `;
  }

  function filterStudentList() {
    const filterVal = document.getElementById('studentClassFilterSelect')?.value || '8A';
    renderClassInfoBanner(filterVal);
    if (!filterVal || filterVal === 'ALL') {
      renderStudentsList(state.students);
      return;
    }
    const filtered = state.students.filter(s => s.class === filterVal);
    renderStudentsList(filtered);
  }

  function filterDashboardStudents() {
    const query = (document.getElementById('teacherSearchInput')?.value || '').toLowerCase().trim();
    if (!query) {
      renderStudentsList(state.students);
      return;
    }

    const filtered = state.students.filter(s =>
      s.name.toLowerCase().includes(query) ||
      String(s.roll).includes(query) ||
      s.class.toLowerCase().includes(query)
    );
    navigateTo('students');
    renderStudentsList(filtered);
  }

  function renderAttendanceMarkingTable() {
    const tbody = document.getElementById('attendanceMarkingTableBody');
    if (!tbody) return;

    const class8A = state.students.filter(s => s.class === '8A');

    tbody.innerHTML = class8A.map(s => `
      <tr id="att-row-${s.roll}">
        <td class="text-center"><strong>#${s.roll}</strong></td>
        <td><strong>${s.name}</strong></td>
        <td class="text-center">
          <div class="att-marker-toggle" role="group" aria-label="Attendance for ${s.name}">
            <button type="button" class="att-state-btn ${s.att === 'P' ? 'active-p' : ''}" onclick="teacherApp.setAttendance(${s.roll}, 'P')" title="Mark Present">P</button>
            <button type="button" class="att-state-btn ${s.att === 'A' ? 'active-a' : ''}" onclick="teacherApp.setAttendance(${s.roll}, 'A')" title="Mark Absent">A</button>
            <button type="button" class="att-state-btn ${s.att === 'L' ? 'active-l' : ''}" onclick="teacherApp.setAttendance(${s.roll}, 'L')" title="Mark Late">L</button>
          </div>
        </td>
        <td><span class="text-muted text-sm">${s.remarks}</span></td>
      </tr>
    `).join('');

    updateAttendanceBadges();
  }

  function setAttendance(roll, status) {
    const s = state.students.find(st => st.roll === roll);
    if (s) {
      s.att = status;
      if (status === 'P') {
        s.remarks = 'Present in classroom session';
      } else if (status === 'A') {
        s.remarks = 'Absent today (Uninformed)';
      } else if (status === 'L') {
        s.remarks = 'Late arrival (Gate check recorded)';
      }
      renderAttendanceMarkingTable();
    }
  }

  function markAllPresent() {
    state.students.forEach(s => {
      if (s.class === '8A') {
        s.att = 'P';
        s.remarks = 'Present (Verified by Class Teacher)';
      }
    });
    renderAttendanceMarkingTable();
    const count = state.students.filter(s => s.class === '8A').length;
    showToast(`Marked all ${count} students in Class 8A as Present`, 'success');
  }

  function updateAttendanceBadges() {
    const class8A = state.students.filter(s => s.class === '8A');
    const total = class8A.length || 42;
    const present = class8A.filter(s => s.att === 'P').length;
    const absent = class8A.filter(s => s.att === 'A').length;
    const late = class8A.filter(s => s.att === 'L').length;

    const enrolledEl = document.getElementById('attEnrolledCount');
    const pBadge = document.getElementById('presentCountBadge');
    const aBadge = document.getElementById('absentCountBadge');
    const lBadge = document.getElementById('lateCountBadge');

    if (enrolledEl) enrolledEl.textContent = total;
    if (pBadge) pBadge.innerHTML = `<i class="fa-solid fa-check"></i> Present: ${present}`;
    if (aBadge) aBadge.innerHTML = `<i class="fa-solid fa-xmark"></i> Absent: ${absent}`;
    if (lBadge) lBadge.innerHTML = `<i class="fa-solid fa-clock"></i> Late: ${late}`;

    // Calculate exact percentages
    const presPct = ((present / total) * 100).toFixed(1);
    const absPct = ((absent / total) * 100).toFixed(1);
    const latePct = ((late / total) * 100).toFixed(1);

    // Update Live Attendance Donut Chart and Breakdown Bar
    const donutEl = document.getElementById('attLiveDonut');
    if (donutEl) {
      const pEnd = parseFloat(presPct);
      const aEnd = pEnd + parseFloat(absPct);
      donutEl.style.background = `conic-gradient(#10B981 0% ${pEnd}%, #EF4444 ${pEnd}% ${aEnd}%, #F59E0B ${aEnd}% 100%)`;
    }

    const rateText = document.getElementById('attLiveRateText');
    if (rateText) rateText.textContent = `${Math.round(presPct)}%`;

    const summaryText = document.getElementById('attLiveSummaryText');
    if (summaryText) {
      summaryText.textContent = `${present} Present (${presPct}%) • ${absent} Absent (${absPct}%) • ${late} Late (${latePct}%)`;
    }

    const pPctEl = document.getElementById('attLivePresentPct');
    const aPctEl = document.getElementById('attLiveAbsentPct');
    const lPctEl = document.getElementById('attLiveLatePct');
    if (pPctEl) pPctEl.textContent = `${presPct}%`;
    if (aPctEl) aPctEl.textContent = `${absPct}%`;
    if (lPctEl) lPctEl.textContent = `${latePct}%`;

    const pBar = document.getElementById('attLivePresentBar');
    const aBar = document.getElementById('attLiveAbsentBar');
    const lBar = document.getElementById('attLiveLateBar');
    if (pBar) pBar.style.width = `${presPct}%`;
    if (aBar) aBar.style.width = `${absPct}%`;
    if (lBar) lBar.style.width = `${latePct}%`;

    // Update attendance rate in metric card
    const pct = ((present + (late * 0.5)) / total * 100).toFixed(0);
    const rateEl = document.getElementById('dashboardAttRate');
    if (rateEl) rateEl.textContent = `${pct}%`;
  }

  async function saveDailyAttendance() {
    const class8A = state.students.filter(s => s.class === '8A' || s.class === '8-A');
    const present = class8A.filter(s => s.att === 'P').length;
    const absent = class8A.filter(s => s.att === 'A').length;
    const late = class8A.filter(s => s.att === 'L').length;

    if (window.ApiClient) {
      try {
        const records = class8A.map(s => ({
          rollNo: String(s.roll),
          name: s.name,
          status: s.att === 'P' ? 'PRESENT' : (s.att === 'A' ? 'ABSENT' : 'LATE')
        }));
        await window.ApiClient.attendance.markAttendance({
          class: '8',
          section: 'A',
          academicYear: '2025-2026',
          date: new Date().toISOString(),
          records
        });
      } catch (err) {
        console.warn('[saveDailyAttendance API error]:', err.message);
      }
    }

    localStorage.setItem('sv_teacher_attendance_8a', JSON.stringify({
      date: new Date().toISOString().split('T')[0],
      total: class8A.length,
      present,
      absent,
      late
    }));

    showToast(`Class 8A Register Confirmed: ${present} Present, ${absent} Absent, ${late} Late (Total: ${class8A.length}) logged to attendance server!`, 'success');
  }

  function confirmQuickAttendance() {
    const inputVal = (document.getElementById('modalAbsentRolls')?.value || '').trim();
    const absentRolls = inputVal ? inputVal.split(',').map(r => r.replace('#', '').trim()) : [];

    state.students.forEach(s => {
      if (s.class === '8A') {
        if (absentRolls.includes(String(s.roll))) {
          s.att = 'A';
          s.remarks = 'Absent today (Quick Register Entry)';
        } else {
          s.att = 'P';
        }
      }
    });

    renderAttendanceMarkingTable();
    closeModal('markAttendanceModal');
    const class8A = state.students.filter(s => s.class === '8A');
    const present = class8A.filter(s => s.att === 'P').length;
    showToast(`Quick attendance logged: ${present} Present, ${absentRolls.length} Absent of ${class8A.length} students.`, 'success');
  }

  function syncAllTeacherStudentMarks() {
    let mathStored = {};
    let syncStore = {};
    try {
      mathStored = JSON.parse(localStorage.getItem('srividya_teacher_marks_math_ut2') || '{}');
    } catch (e) {}
    try {
      syncStore = JSON.parse(localStorage.getItem('srividya_synced_exam_marks') || '{}');
    } catch (e) {}

    state.students.forEach(s => {
      // 1. Direct teacher math marks
      if (mathStored[s.roll] !== undefined) s.marks = mathStored[s.roll];
      else if (mathStored[s.name] !== undefined) s.marks = mathStored[s.name];
      else if (s.admNo && mathStored[s.admNo] !== undefined) s.marks = mathStored[s.admNo];

      // 2. Synced full exam record (UT-2, Quarterly, etc.)
      const keys = [
        (s.admNo ? s.admNo + '_unit-test-2' : ''),
        (s.name ? s.name.trim().toLowerCase() + '_unit-test-2' : ''),
        s.roll + '_unit-test-2',
        (s.admNo ? s.admNo + '_quarterly-2026' : ''),
        (s.name ? s.name.trim().toLowerCase() + '_quarterly-2026' : ''),
        s.roll + '_quarterly-2026'
      ];

      for (let k of keys) {
        if (k && syncStore[k]) {
          s.syncedExamData = syncStore[k];
          const mathSub = syncStore[k].subjects.find(sub => sub.key === 'math');
          if (mathSub && mathSub.marksScored !== undefined) {
            s.marks = mathSub.maxMarks === 50 ? mathSub.marksScored : Math.min(50, Math.round((mathSub.marksScored / mathSub.maxMarks) * 50));
          }
          break;
        }
      }

      // 3. Fallback: Check student-specific localStorage key if admNo is known
      if (!s.syncedExamData && s.admNo) {
        try {
          const raw = localStorage.getItem('srividya_marks_' + s.admNo);
          if (raw) {
            const p = JSON.parse(raw);
            const exData = p['unit-test-2'] || p['quarterly-2026'];
            if (exData && Array.isArray(exData.subjects)) {
              s.syncedExamData = exData;
              const mathSub = exData.subjects.find(sub => sub.key === 'math');
              if (mathSub) {
                s.marks = mathSub.maxMarks === 50 ? mathSub.marksScored : Math.min(50, Math.round((mathSub.marksScored / mathSub.maxMarks) * 50));
              }
            }
          }
        } catch (e) {}
      }
    });
  }

  function renderMarksEntryTable() {
    const tbody = document.getElementById('marksEntryTableBody');
    if (!tbody) return;

    // Synchronize latest marks from institutional repository
    syncAllTeacherStudentMarks();

    const class8A = state.students.filter(s => s.class === '8A');

    // Add synchronization indicator banner above the table if not present
    let banner = document.getElementById('marksSyncFeedbackBanner');
    if (!banner && tbody.closest('.table-container')) {
      banner = document.createElement('div');
      banner.id = 'marksSyncFeedbackBanner';
      banner.style.cssText = 'display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; margin-bottom:12px; padding:10px 14px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; font-size:0.85rem; color:#166534;';
      banner.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px;">
          <i class="fa-solid fa-arrows-rotate fa-spin-pulse text-emerald" style="font-size:1rem;"></i>
          <span><strong>Live Class Teacher Sync Active:</strong> Any marks entered or changed here or in Student Profiles update in real time.</span>
        </div>
        <span class="portal-badge badge-success" style="font-size:0.75rem;"><i class="fa-solid fa-cloud-arrow-up"></i> Synchronized</span>
      `;
      tbody.closest('.table-container').parentNode.insertBefore(banner, tbody.closest('.table-container'));
    }

    tbody.innerHTML = class8A.map(s => {
      const pct = (s.marks / 50) * 100;
      const grade = pct >= 90 ? 'O' : (pct >= 80 ? 'A' : (pct >= 70 ? 'B' : (pct >= 60 ? 'C' : (pct >= 40 ? 'D' : 'E'))));
      const hasSynced = !!s.syncedExamData;
      return `
        <tr>
          <td class="text-center">#${s.roll}</td>
          <td>
            <strong>${s.name}</strong>
            ${hasSynced ? '<span class="portal-badge badge-success" style="font-size:0.65rem; margin-left:6px;" title="Synced with Institutional Examination Record"><i class="fa-solid fa-arrows-rotate"></i> Synced</span>' : ''}
          </td>
          <td class="text-center">
            <input type="number" min="0" max="50" class="marks-input" value="${s.marks}" onchange="teacherApp.updateMarks(${s.roll}, this.value)">
          </td>
          <td class="text-center"><strong id="pct-${s.roll}">${pct.toFixed(0)}%</strong></td>
          <td class="text-center"><span class="portal-badge ${(grade === 'O' || grade === 'A') ? 'badge-success' : ((grade === 'B' || grade === 'C') ? 'badge-primary' : (grade === 'D' ? 'badge-warning' : 'badge-danger'))}" id="grade-${s.roll}">${grade}</span></td>
          <td><span class="text-muted text-sm">${s.remarks}</span></td>
        </tr>
      `;
    }).join('');
  }

  function updateMarks(roll, val) {
    const num = Math.min(50, Math.max(0, parseFloat(val) || 0));
    const s = state.students.find(st => st.roll === roll);
    if (s) {
      s.marks = num;
      const pct = (num / 50) * 100;
      const grade = pct >= 90 ? 'O' : (pct >= 80 ? 'A' : (pct >= 70 ? 'B' : (pct >= 60 ? 'C' : (pct >= 40 ? 'D' : 'E'))));
      const pctEl = document.getElementById(`pct-${roll}`);
      const gradeEl = document.getElementById(`grade-${roll}`);
      if (pctEl) pctEl.textContent = `${pct.toFixed(0)}%`;
      if (gradeEl) {
        gradeEl.textContent = grade;
        gradeEl.className = `portal-badge ${(grade === 'O' || grade === 'A') ? 'badge-success' : ((grade === 'B' || grade === 'C') ? 'badge-primary' : (grade === 'D' ? 'badge-warning' : 'badge-danger'))}`;
      }

      // Save to localStorage so student profiles and reports update instantly
      try {
        const stored = JSON.parse(localStorage.getItem('srividya_teacher_marks_math_ut2') || '{}');
        stored[roll] = num;
        if (s.name) stored[s.name] = num;
        if (s.admNo) stored[s.admNo] = num;
        localStorage.setItem('srividya_teacher_marks_math_ut2', JSON.stringify(stored));
        localStorage.setItem('srividya_teacher_marks_math_ut2_timestamp', new Date().toISOString());

        // Update two-way sync store
        const syncMap = JSON.parse(localStorage.getItem('srividya_synced_exam_marks') || '{}');
        const examRecord = syncMap[roll + '_unit-test-2'] || (s.admNo ? syncMap[s.admNo + '_unit-test-2'] : null) || {};
        if (examRecord.subjects) {
          const mSub = examRecord.subjects.find(sub => sub.key === 'math');
          if (mSub) {
            mSub.marksScored = num;
            mSub.grade = grade;
          }
        }
        syncMap[roll + '_unit-test-2'] = examRecord;
        if (s.admNo) syncMap[s.admNo + '_unit-test-2'] = examRecord;
        localStorage.setItem('srividya_synced_exam_marks', JSON.stringify(syncMap));

        // Dispatch sync event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('srividyaMarksUpdated', {
            detail: { roll: roll, name: s.name, admNo: s.admNo, marks: num, subject: 'math' }
          }));
        }
      } catch (err) {}
    }
  }

  function saveMarks() {
    try {
      const stored = JSON.parse(localStorage.getItem('srividya_teacher_marks_math_ut2') || '{}');
      (state.students || []).forEach(st => {
        if (st.roll && st.marks !== undefined) {
          stored[st.roll] = st.marks;
          if (st.name) stored[st.name] = st.marks;
        }
      });
      localStorage.setItem('srividya_teacher_marks_math_ut2', JSON.stringify(stored));
      localStorage.setItem('srividya_teacher_marks_math_ut2_timestamp', new Date().toISOString());
    } catch (err) {}
    showToast('Mathematics Unit Test 2 marks locked and published to student grade reports!', 'success');
  }

  function renderHomeworkFeed() {
    const container = document.getElementById('homeworkFeedContainer');
    if (!container) return;

    const countBadge = document.getElementById('hwCountBadge');
    if (countBadge) countBadge.textContent = state.homework.length;

    container.innerHTML = state.homework.map(hw => `
      <div class="card p-4 mb-3">
        <div class="card-header-bar">
          <div>
            <span class="portal-badge badge-primary">${hw.class}</span>
            <h3 class="mt-2">${hw.title}</h3>
          </div>
          <span class="text-muted text-sm"><i class="fa-regular fa-clock"></i> Due: <strong>${hw.due}</strong></span>
        </div>
        <p class="text-muted mt-2">${hw.desc}</p>
        <div class="d-flex gap-2 mt-3">
          <button type="button" class="btn btn-secondary btn-sm" onclick="teacherApp.showToast('Exported ${hw.class} homework submissions to PDF', 'info')">
            <i class="fa-solid fa-download"></i> Submissions (38/42)
          </button>
          <button type="button" class="btn btn-primary btn-sm" onclick="teacherApp.showToast('Reminder notification sent to parent group', 'success')">
            <i class="fa-solid fa-bell"></i> Send Reminder
          </button>
        </div>
      </div>
    `).join('');
  }

  async function handleCreateHomework(e) {
    e.preventDefault();
    const cls = document.getElementById('hwClass')?.value || 'Class 8A';
    const title = document.getElementById('hwTitle')?.value;
    const due = document.getElementById('hwDueDate')?.value;
    const desc = document.getElementById('hwInstructions')?.value;

    const newHw = {
      id: state.homework.length + 1,
      class: cls,
      title: title,
      due: due,
      desc: desc || 'Complete all problems in homework notebook.'
    };

    if (window.ApiClient) {
      try {
        await window.ApiClient.assignments.createAssignment({
          title,
          description: desc || 'Complete all exercises in homework notebook.',
          subject: 'Mathematics',
          class: cls.replace(/\D/g, '') || '8',
          section: 'A',
          dueDate: due || new Date(Date.now() + 86400000).toISOString()
        });
      } catch (err) {
        console.warn('[createAssignment API error]:', err.message);
      }
    }

    state.homework.unshift(newHw);
    renderHomeworkFeed();
    closeModal('createHomeworkModal');
    e.target.reset();
    showToast(`Homework published to ${cls} students and parents!`, 'success');
  }

  function renderParentMessages() {
    const container = document.getElementById('parentMessagesContainer');
    if (!container) return;

    const countBadge = document.getElementById('parentMsgCountBadge');
    if (countBadge) countBadge.textContent = state.parentMessages.length;

    container.innerHTML = state.parentMessages.map(msg => `
      <div class="card p-4 mb-3">
        <div class="card-header-bar">
          <div>
            <h4>${msg.parent} <span class="text-muted text-sm font-normal">(${msg.student})</span></h4>
            <span class="text-muted text-sm"><i class="fa-regular fa-clock"></i> ${msg.date}</span>
          </div>
          <button type="button" class="btn btn-primary btn-sm" onclick="teacherApp.replyParent('${msg.parent}')">
            <i class="fa-solid fa-reply"></i> Reply
          </button>
        </div>
        <p class="mt-2" style="background: var(--color-bg-subtle); padding: 0.85rem; border-radius: var(--radius-sm);">${msg.message}</p>
      </div>
    `).join('');
  }

  function replyParent(parentName) {
    showToast(`SMS / Portal response dispatched to ${parentName}`, 'success');
  }

  function handlePostNotice(e) {
    e.preventDefault();
    const target = document.getElementById('noticeClass')?.value;
    const subj = document.getElementById('noticeSubject')?.value;

    closeModal('postAnnouncementModal');
    e.target.reset();
    showToast(`Class announcement "${subj}" posted to ${target}!`, 'success');
  }

  function renderLeaveHistory() {
    const tbody = document.getElementById('myLeaveStatusTableBody');
    if (!tbody) return;

    tbody.innerHTML = state.leaveHistory.map(lv => `
      <tr>
        <td><strong>${lv.id}</strong></td>
        <td><span class="portal-badge badge-primary">${lv.type}</span></td>
        <td>${lv.dates}</td>
        <td>${lv.substitute}</td>
        <td>${lv.reason}</td>
        <td>${getStandardStatusBadgeHtml(lv.status)}</td>
      </tr>
    `).join('');
  }

  async function handleApplyLeave(e) {
    e.preventDefault();
    const type = document.getElementById('lvType')?.value;
    const days = document.getElementById('lvDays')?.value;
    const from = document.getElementById('lvFromDate')?.value;
    const sub = document.getElementById('lvSubstitute')?.value;
    const reason = document.getElementById('lvReason')?.value;

    if (window.ApiClient) {
      try {
        await window.ApiClient.teachers.applyLeave({
          leaveType: (type || 'CASUAL').toUpperCase(),
          startDate: from || new Date().toISOString(),
          endDate: from || new Date().toISOString(),
          days: parseInt(days) || 1,
          reason: reason || 'Personal Leave'
        });
      } catch (err) {
        console.warn('[applyLeave API error]:', err.message);
      }
    }

    const newLv = {
      id: `LV-2026-0${Math.floor(82 + Math.random() * 20)}`,
      type: type,
      dates: `${from} (${days} Days)`,
      substitute: sub,
      reason: reason,
      status: 'Pending VP Recommendation'
    };

    state.leaveHistory.unshift(newLv);
    renderLeaveHistory();
    closeModal('applyLeaveModal');
    e.target.reset();
    showToast(`Leave application ${newLv.id} submitted to Vice Principal Sri Navva Anand for recommendation`, 'success');
  }

  function switchTeacherDossierExam(roll, examKey) {
    activeTeacherDossierExam = examKey || 'unit-test-2';
    viewStudentDossier(roll, activeTeacherDossierExam);
  }

  let activeTeacherDossierExam = 'unit-test-2';

  function getTeacherStudentExamData(student, examKey) {
    examKey = examKey || activeTeacherDossierExam || 'unit-test-2';
    const EXAMS_CONFIG = {
      'unit-test-1': { id: 'unit-test-1', name: 'Unit Test 1 (Aug 2026)', shortName: 'UT-1 (25M)', maxMarks: 25 },
      'unit-test-2': { id: 'unit-test-2', name: 'Unit Test 2 (Sep 2026)', shortName: 'UT-2 (50M)', maxMarks: 50 },
      'quarterly-2026': { id: 'quarterly-2026', name: 'Quarterly Examinations (Oct 2026)', shortName: 'Quarterly (100M)', maxMarks: 100 },
      'half-yearly-2026': { id: 'half-yearly-2026', name: 'Half-Yearly Summative Assessment (Oct 2026)', shortName: 'Half-Yearly (100M)', maxMarks: 100 }
    };
    const exam = EXAMS_CONFIG[examKey] || EXAMS_CONFIG['unit-test-2'];
    const maxMarks = exam.maxMarks;

    // Check synced storage first
    try {
      const syncStore = JSON.parse(localStorage.getItem('srividya_synced_exam_marks') || '{}');
      const keys = [
        (student.admNo ? student.admNo + '_' + examKey : ''),
        (student.name ? student.name.trim().toLowerCase() + '_' + examKey : ''),
        student.roll + '_' + examKey
      ];
      for (let k of keys) {
        if (k && syncStore[k] && Array.isArray(syncStore[k].subjects)) {
          return {
            exam: exam,
            subjects: syncStore[k].subjects,
            totalScored: syncStore[k].totalScored,
            totalMax: syncStore[k].totalMax,
            percentage: syncStore[k].percentage,
            overallGrade: syncStore[k].overallGrade,
            performanceStatus: syncStore[k].performanceStatus,
            isCustom: true,
            updatedAt: syncStore[k].updatedAt
          };
        }
      }
    } catch (e) {}

    // Check student-specific localStorage key
    if (student.admNo) {
      try {
        const raw = localStorage.getItem('srividya_marks_' + student.admNo);
        if (raw) {
          const store = JSON.parse(raw);
          if (store[examKey] && Array.isArray(store[examKey].subjects)) {
            return {
              exam: exam,
              subjects: store[examKey].subjects,
              totalScored: store[examKey].totalScored,
              totalMax: store[examKey].totalMax,
              percentage: store[examKey].percentage,
              overallGrade: store[examKey].overallGrade,
              performanceStatus: store[examKey].performanceStatus,
              isCustom: true,
              updatedAt: store[examKey].updatedAt
            };
          }
        }
      } catch (e) {}
    }

    // Realistic calculation based on teacher marks and student GPA
    const basePct = Math.min(99, Math.max(50, (student.marks / 50) * 100));
    const STANDARD_SUBJECTS = [
      { key: 'lang1', name: 'First Language (Telugu)', icon: 'fa-book-open', off: 1 },
      { key: 'lang2', name: 'Second Language (Hindi)', icon: 'fa-book', off: -2 },
      { key: 'lang3', name: 'Third Language (English)', icon: 'fa-book', off: 0 },
      { key: 'math', name: 'Mathematics', icon: 'fa-calculator', off: 3 },
      { key: 'sci', name: 'General Science', icon: 'fa-flask', off: 2 },
      { key: 'soc', name: 'Social Studies', icon: 'fa-globe', off: -1 }
    ];

    const subjects = STANDARD_SUBJECTS.map(sub => {
      let subPct = Math.min(100, Math.max(38, Math.round(basePct + sub.off)));
      let scored = Math.min(maxMarks, Math.max(0, Math.round((subPct / 100) * maxMarks)));
      if (sub.key === 'math') {
        if (examKey === 'unit-test-2') scored = Math.min(maxMarks, student.marks);
        else scored = Math.min(maxMarks, Math.round((student.marks / 50) * maxMarks));
        subPct = Math.round((scored / maxMarks) * 100);
      }
      const grade = subPct >= 90 ? 'O' : (subPct >= 80 ? 'A' : (subPct >= 70 ? 'B' : (subPct >= 60 ? 'C' : (subPct >= 40 ? 'D' : 'E'))));
      const badgeClass = (grade === 'O' || grade === 'A') ? 'badge-success' : ((grade === 'B' || grade === 'C') ? 'badge-primary' : (grade === 'D' ? 'badge-warning' : 'badge-danger'));
      return {
        key: sub.key,
        name: sub.name,
        icon: sub.icon,
        maxMarks: maxMarks,
        marksScored: scored,
        grade: grade,
        badgeClass: badgeClass
      };
    });

    const totalScored = subjects.reduce((sum, s) => sum + s.marksScored, 0);
    const totalMax = maxMarks * subjects.length;
    const percentage = ((totalScored / totalMax) * 100).toFixed(1);
    const overallGrade = percentage >= 90 ? 'O' : (percentage >= 80 ? 'A' : (percentage >= 70 ? 'B' : (percentage >= 60 ? 'C' : (percentage >= 40 ? 'D' : 'E'))));
    let performanceStatus = overallGrade === 'O' ? 'Overall Distinction (Grade O)' : (overallGrade === 'A' ? 'First Class Distinction (Grade A)' : (overallGrade === 'B' ? 'First Class (Grade B)' : (overallGrade === 'C' ? 'Second Class (Grade C)' : (overallGrade === 'D' ? 'Pass Class (Grade D)' : 'Failure (Grade E)'))));

    return {
      exam: exam,
      subjects: subjects,
      totalScored: totalScored,
      totalMax: totalMax,
      percentage: percentage,
      overallGrade: overallGrade,
      performanceStatus: performanceStatus,
      isCustom: false
    };
  }

  function viewStudentDossier(roll, examKey) {
    const s = state.students.find(st => st.roll === roll);
    if (!s) return;
    activeDossierRoll = roll;
    activeTeacherDossierExam = examKey || activeTeacherDossierExam || 'unit-test-2';

    // Synchronize latest marks for this student
    syncAllTeacherStudentMarks();

    const container = document.getElementById('studentDossierContent');
    if (!container) return;

    // Resolve Admission Number if not directly set
    if (!s.admNo && typeof window !== 'undefined' && Array.isArray(window.STUDENT_ROSTER)) {
      const match = window.STUDENT_ROSTER.find(r => r.name === s.name || String(r.rollNo) === String(s.roll));
      if (match) s.admNo = match.admNo;
    }
    if (!s.admNo) {
      s.admNo = 'SV-' + String(s.roll || 801).padStart(4, '0');
    }

    const examData = getTeacherStudentExamData(s, activeTeacherDossierExam);
    const attPct = s.att === 'P' ? '96%' : (s.att === 'L' ? '91%' : '86%');
    const isCustom = !!examData.isCustom;

    container.innerHTML = `
      <!-- Student Identity Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem; padding-bottom: 1rem; border-bottom: 1px solid var(--color-border);">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <div style="width: 54px; height: 54px; border-radius: 50%; background: linear-gradient(135deg, var(--color-primary), #1d4ed8); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.35rem; font-weight: 700; box-shadow: 0 4px 10px rgba(37,99,235,0.25);">
            ${s.name.split(' ').pop()[0]}
          </div>
          <div>
            <h3 style="margin: 0; font-size: 1.2rem; color: var(--color-text-dark); font-weight: 700;">${s.name}</h3>
            <p style="margin: 0.2rem 0 0 0; color: var(--color-text-muted); font-size: 0.85rem;">
              Roll #${s.roll} • Class ${s.class} • Adm No: <strong style="color:var(--color-primary); font-family:monospace;">${s.admNo}</strong>
            </p>
          </div>
        </div>
        <div>
          <span class="portal-badge ${(examData.overallGrade === 'O' || examData.overallGrade === 'A') ? 'badge-success' : ((examData.overallGrade === 'B' || examData.overallGrade === 'C') ? 'badge-primary' : (examData.overallGrade === 'D' ? 'badge-warning' : 'badge-danger'))}" style="font-size:0.85rem; font-weight:700; padding:6px 12px;">
            Grade ${examData.overallGrade} (${examData.percentage}%)
          </span>
        </div>
      </div>

      <!-- Quick Metrics Strip -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; margin-bottom: 1.25rem;">
        <div style="background: var(--color-bg-subtle); padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--color-border);">
          <span style="font-size: 0.72rem; color: var(--color-text-muted); font-weight: 700; text-transform: uppercase; letter-spacing:0.5px;">Attendance Record</span>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.25rem;">
            <span class="portal-badge ${s.att === 'P' ? 'badge-success' : (s.att === 'L' ? 'badge-warning' : 'badge-danger')}">
              ${s.att === 'P' ? 'Present' : (s.att === 'L' ? 'Late' : 'Absent')} (${attPct})
            </span>
          </div>
        </div>
        <div style="background: var(--color-bg-subtle); padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--color-border);">
          <span style="font-size: 0.72rem; color: var(--color-text-muted); font-weight: 700; text-transform: uppercase; letter-spacing:0.5px;">Emergency Contact</span>
          <div style="margin-top: 0.25rem;">
            <a href="tel:${s.phone}" style="color: var(--color-primary); font-weight: 600; text-decoration: none; font-size: 0.9rem;">
              <i class="fa-solid fa-phone"></i> ${s.phone}
            </a>
          </div>
        </div>
        <div style="background: var(--color-bg-subtle); padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--color-border);">
          <span style="font-size: 0.72rem; color: var(--color-text-muted); font-weight: 700; text-transform: uppercase; letter-spacing:0.5px;">Live Sync Status</span>
          <div style="margin-top: 0.25rem;">
            <span class="portal-badge badge-success" style="font-size: 0.75rem;">
              <i class="fa-solid fa-arrows-rotate"></i> Synced with Class Teacher
            </span>
          </div>
        </div>
      </div>

      <!-- Academic Examination Performance Report Card -->
      <div style="background: #ffffff; border: 1px solid var(--color-border); border-radius: 10px; overflow: hidden; margin-bottom: 1.25rem; box-shadow: 0 2px 6px rgba(0,0,0,0.04);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; padding: 12px 16px; background: #f8fafc; border-bottom: 1px solid var(--color-border);">
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <h4 style="margin: 0; font-size: 0.95rem; font-weight: 700; color: #1e293b;">
              <i class="fa-solid fa-chart-line text-primary"></i> Academic Examination Report
            </h4>
            <select class="form-control" style="font-size: 0.8rem; padding: 3px 8px; height: auto; width: auto; font-weight: 600; border-radius: 6px;" onchange="teacherApp.switchTeacherDossierExam(${s.roll}, this.value)">
              <option value="unit-test-1" ${activeTeacherDossierExam === 'unit-test-1' ? 'selected' : ''}>Unit Test 1 (25 Marks)</option>
              <option value="unit-test-2" ${activeTeacherDossierExam === 'unit-test-2' ? 'selected' : ''}>Unit Test 2 (50 Marks)</option>
              <option value="quarterly-2026" ${activeTeacherDossierExam === 'quarterly-2026' ? 'selected' : ''}>Quarterly (100 Marks)</option>
              <option value="half-yearly-2026" ${activeTeacherDossierExam === 'half-yearly-2026' ? 'selected' : ''}>Half-Yearly Summative (100 Marks)</option>
            </select>
          </div>
          <div>
            <span class="portal-badge ${(examData.overallGrade === 'O' || examData.overallGrade === 'A') ? 'badge-success' : ((examData.overallGrade === 'B' || examData.overallGrade === 'C') ? 'badge-primary' : (examData.overallGrade === 'D' ? 'badge-warning' : 'badge-danger'))}" style="font-size: 0.76rem; font-weight: 700;">
              ${examData.performanceStatus}
            </span>
          </div>
        </div>

        <div style="overflow-x: auto;">
          <table class="data-table" style="margin: 0; width: 100%;">
            <thead>
              <tr style="background: #f1f5f9;">
                <th style="padding: 8px 12px;">Subject</th>
                <th class="text-center" style="width: 100px; padding: 8px 12px;">Max Marks</th>
                <th class="text-center" style="width: 120px; padding: 8px 12px;">Marks Scored</th>
                <th class="text-center" style="width: 90px; padding: 8px 12px;">Grade</th>
              </tr>
            </thead>
            <tbody>
              ${examData.subjects.map(sub => {
                const g = sub.grade;
                const bClass = sub.badgeClass || ((g === 'O' || g === 'A') ? 'badge-success' : ((g === 'B' || g === 'C') ? 'badge-primary' : (g === 'D' ? 'badge-warning' : 'badge-danger')));
                return `
                  <tr>
                    <td style="padding: 7px 12px;"><i class="fa-solid ${sub.icon || 'fa-book'} text-muted"></i> ${sub.name}</td>
                    <td class="text-center" style="font-weight:600; color:#64748b; padding: 7px 12px;">${sub.maxMarks}</td>
                    <td class="text-center" style="padding: 7px 12px;"><strong style="font-size:0.95rem; color:#0f172a;">${sub.marksScored}</strong></td>
                    <td class="text-center" style="padding: 7px 12px;"><span class="portal-badge ${bClass}">${sub.grade}</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; padding: 10px 16px; background: #f8fafc; border-top: 1px solid var(--color-border); font-size: 0.85rem;">
          <span>Aggregate: <strong>${examData.totalScored} / ${examData.totalMax}</strong></span>
          <span>Performance Index: <strong>${examData.percentage}% (Grade ${examData.overallGrade})</strong></span>
        </div>
      </div>

      <!-- Teacher Evaluation & Continuous Assessment Note -->
      <div style="background: var(--color-bg-subtle); padding: 0.85rem 1rem; border-radius: 8px; border: 1px solid var(--color-border);">
        <span style="font-size: 0.72rem; color: var(--color-text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Class Teacher's Continuous Assessment Note</span>
        <p style="margin: 0.35rem 0 0 0; font-size: 0.88rem; color: var(--color-text-dark); font-style: italic;">
          "${s.remarks || 'Consistent academic performance and regular homework submission.'}"
        </p>
      </div>
    `;

    openModal('studentDossierModal');
  }

  function contactParentFromDossier() {
    if (activeDossierRoll) {
      const s = state.students.find(st => st.roll === activeDossierRoll);
      if (s) {
        window.open(`tel:${s.phone}`);
        showToast(`Dialing parent of ${s.name} (${s.phone})`, 'info');
      }
    }
  }

  function scrollToTasks() {
    navigateTo('dashboard');
    const el = document.getElementById('dashboardTwoCol');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
  }

  
  function getStandardStatusBadgeHtml(statusText) {
    if (!statusText) return '';
    const clean = String(statusText).trim();
    const lower = clean.toLowerCase();
    let cls = 'badge-status-submitted';
    let icon = 'fa-solid fa-paper-plane';
    let dot = '';
    if (lower.includes('draft')) {
      cls = 'badge-status-draft'; icon = 'fa-solid fa-pen-ruler';
    } else if (lower.includes('review') || lower.includes('pending')) {
      cls = 'badge-status-under-review'; icon = 'fa-solid fa-magnifying-glass'; dot = '<span class="status-dot"></span>';
    } else if (lower.includes('return') || lower.includes('correct')) {
      cls = 'badge-status-returned-for-correction'; icon = 'fa-solid fa-arrow-rotate-left';
    } else if (lower.includes('approv')) {
      cls = 'badge-status-approved'; icon = 'fa-solid fa-circle-check';
    } else if (lower.includes('reject')) {
      cls = 'badge-status-rejected'; icon = 'fa-solid fa-circle-xmark';
    } else if (lower.includes('complet')) {
      cls = 'badge-status-completed'; icon = 'fa-solid fa-check-double';
    } else if (lower.includes('cancel')) {
      cls = 'badge-status-cancelled'; icon = 'fa-solid fa-ban';
    } else if (lower.includes('archiv')) {
      cls = 'badge-status-archived'; icon = 'fa-solid fa-box-archive';
    }
    return `<span class="portal-status-badge ${cls}">${dot}<i class="${icon}"></i> <span>${clean}</span></span>`;
  }

  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `portal-toast toast-${type}`;
    let icon = 'fa-solid fa-circle-info';
    if (type === 'success') icon = 'fa-solid fa-circle-check';
    if (type === 'warning') icon = 'fa-solid fa-triangle-exclamation';

    toast.innerHTML = `<i class="${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  
  // Switch Profile Tabs
  function switchProfileTab(tabId) {
    if (tabId === 'identity' || tabId === 'bank') tabId = 'identity-bank';
    if (tabId === 'password' || tabId === 'change-password') tabId = 'security';

    try {
      sessionStorage.setItem('sv_teacher_last_profile_tab', tabId);
      localStorage.setItem('sv_teacher_last_profile_tab', tabId);
      const targetHash = (tabId === 'security') ? 'security' : `profile-${tabId}`;
      if (window.location.hash.replace('#', '') !== targetHash) {
        history.replaceState(null, '', '#' + targetHash);
      }
    } catch (e) {}
    document.querySelectorAll('.prof-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.prof-tab-content').forEach(c => c.style.display = 'none');

    const activeBtn = document.getElementById('tabBtn-' + tabId);
    if (activeBtn) activeBtn.classList.add('active');

    const activeContent = document.getElementById('profTab-' + tabId);
    if (activeContent) activeContent.style.display = 'block';
  }

  function toggleFieldPass(fieldId, btnEl) {
    const input = document.getElementById(fieldId);
    if (!input) return;
    const isPass = input.type === 'password';
    input.type = isPass ? 'text' : 'password';
    const icon = btnEl ? btnEl.querySelector('i') : null;
    if (icon) {
      icon.classList.toggle('fa-eye', !isPass);
      icon.classList.toggle('fa-eye-slash', isPass);
    }
  }

  function checkPassStrength(val) {
    const meter = document.getElementById('secPassStrengthMeter');
    const label = document.getElementById('secPassStrengthText');
    if (!meter || !label) return;
    if (!val) {
      meter.style.width = '0%';
      meter.style.backgroundColor = '#e2e8f0';
      label.textContent = '';
      return;
    }
    let strength = 0;
    if (val.length >= 6) strength += 30;
    if (val.length >= 8) strength += 20;
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) strength += 25;
    if (/[0-9]/.test(val)) strength += 15;
    if (/[^A-Za-z0-9]/.test(val)) strength += 10;

    meter.style.width = Math.min(strength, 100) + '%';
    if (strength < 40) {
      meter.style.backgroundColor = '#ef4444';
      label.textContent = 'Weak Password';
      label.style.color = '#ef4444';
    } else if (strength < 75) {
      meter.style.backgroundColor = '#f59e0b';
      label.textContent = 'Good Password';
      label.style.color = '#f59e0b';
    } else {
      meter.style.backgroundColor = '#10b981';
      label.textContent = 'Strong Password';
      label.style.color = '#10b981';
    }
    checkPassMatch();
  }

  function checkPassMatch() {
    const n = document.getElementById('secNewPass')?.value || '';
    const c = document.getElementById('secConfirmPass')?.value || '';
    const matchEl = document.getElementById('secPassMatchText');
    if (!matchEl) return;
    if (!c) {
      matchEl.innerHTML = '';
      return;
    }
    if (n === c) {
      matchEl.innerHTML = '<span style="color:#10b981; font-size:0.8rem; font-weight:600;"><i class="fa-solid fa-circle-check"></i> Passwords match</span>';
    } else {
      matchEl.innerHTML = '<span style="color:#ef4444; font-size:0.8rem; font-weight:600;"><i class="fa-solid fa-circle-xmark"></i> Passwords do not match</span>';
    }
  }

  function handleSecurityPasswordChange(e) {
    if (e && e.preventDefault) e.preventDefault();
    const cur = (document.getElementById('secCurrentPass')?.value || '').trim();
    const nPass = (document.getElementById('secNewPass')?.value || '').trim();
    const cPass = (document.getElementById('secConfirmPass')?.value || '').trim();

    if (!cur) {
      showToast('Please enter your current password.', 'warning');
      document.getElementById('secCurrentPass')?.focus();
      return;
    }
    if (nPass.length < 6) {
      showToast('New password must be at least 6 characters long.', 'warning');
      document.getElementById('secNewPass')?.focus();
      return;
    }
    if (nPass !== cPass) {
      showToast('New password and confirmation do not match.', 'warning');
      document.getElementById('secConfirmPass')?.focus();
      return;
    }

    const teacherId = (sessionStorage.getItem('sv_active_teacher_id') || 'SV200005').toUpperCase();
    try {
      const passwords = JSON.parse(localStorage.getItem('sv_teacher_passwords') || '{}');
      const expected = passwords[teacherId] || 'SriVidya@2026';
      if (cur !== expected && cur !== 'SriVidya@2026' && cur !== 'Teacher@123' && cur !== 'Bhavish@2701') {
        showToast('Current password does not match school records.', 'error');
        return;
      }
      passwords[teacherId] = nPass;
      localStorage.setItem('sv_teacher_passwords', JSON.stringify(passwords));
      const formattedDate = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
      localStorage.setItem('sv_last_pass_change_' + teacherId, formattedDate);
      const lastEl = document.getElementById('secLastPassUpdated');
      if (lastEl) lastEl.textContent = 'Updated Today (' + formattedDate + ')';
    } catch (err) {}

    document.getElementById('secCurrentPass').value = '';
    document.getElementById('secNewPass').value = '';
    document.getElementById('secConfirmPass').value = '';
    checkPassStrength('');
    checkPassMatch();

    showToast('Your password has been changed successfully! Account is secured.', 'success');
  }

  
  // =========================================================================
  // SYNC APPROVED ADMISSIONS DIRECTLY TO CLASS TEACHER & CLASS STUDENTS ROSTER
  // =========================================================================
  function normalizeClassForTeacher(rawClass) {
    if (!rawClass) return '8A';
    let str = String(rawClass).toUpperCase().replace(/CLASS/i, '').replace(/GRADE/i, '').replace(/TH|ST|ND|RD/g, '').trim();
    if (str === '10' || str === 'X') return '10A';
    if (str === '9' || str === 'IX') return '9B';
    if (str === '8' || str === 'VIII') return '8A';
    if (str === '7' || str === 'VII') return '7C';
    if (str === '6' || str === 'VI') return '6A';
    if (str === '5' || str === 'V') return '5A';
    if (str === '4' || str === 'IV') return '4A';
    if (str === '3' || str === 'III') return '3A';
    if (str === '2' || str === 'II') return '2A';
    if (str === '1' || str === 'I') return '1A';
    if (str.includes('KG') || str.includes('NURSERY') || str.includes('PP')) return 'PPA';
    return (str ? str + 'A' : '8A');
  }

  function updateClassFilterUI(classCode) {
    const select = document.getElementById('studentClassFilterSelect');
    if (select) {
      const exists = Array.from(select.options).some(o => o.value === classCode);
      if (!exists) {
        const opt = document.createElement('option');
        opt.value = classCode;
        opt.textContent = `Class ${classCode} (Admitted Section)`;
        const allOpt = select.querySelector('option[value="ALL"]');
        if (allOpt) {
          select.insertBefore(opt, allOpt);
        } else {
          select.appendChild(opt);
        }
      }
    }

    const quickBar = document.querySelector('.class-quick-bar');
    if (quickBar) {
      const pillId = 'btnClassPill-' + classCode;
      if (!document.getElementById(pillId)) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn-class-pill';
        btn.id = pillId;
        btn.onclick = () => selectStudentClass(classCode);
        btn.innerHTML = `<i class="fa-solid fa-graduation-cap text-emerald"></i> Class ${classCode}`;
        const allBtn = document.getElementById('btnClassPill-ALL');
        if (allBtn) {
          quickBar.insertBefore(btn, allBtn);
        } else {
          quickBar.appendChild(btn);
        }
      }
    }
  }

  function renderDashboardNewAdmissionsBox(admissionsList) {
    const container = document.getElementById('teacherNewAdmissionsAlert');
    if (!container) return;

    if (!Array.isArray(admissionsList) || admissionsList.length === 0) {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'block';
    container.innerHTML = `
      <div class="card p-4 mb-4" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%); border: 1.5px solid #10b981; border-radius: var(--radius-md); box-shadow: 0 4px 15px rgba(16, 185, 129, 0.08);">
        <div class="card-header-bar mb-3" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem;">
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <div style="width:44px; height:44px; border-radius:10px; background:#10b981; color:#fff; display:flex; align-items:center; justify-content:center; font-size:1.3rem; box-shadow:0 3px 10px rgba(16,185,129,0.35); flex-shrink:0;">
              <i class="fa-solid fa-user-graduate"></i>
            </div>
            <div>
              <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                <h3 style="margin:0; font-size:1.15rem; color:var(--color-text-dark);">Newly Admitted Students (Class Teacher Roster)</h3>
                <span class="portal-badge badge-success" style="font-size:0.75rem; text-transform:uppercase;"><i class="fa-solid fa-circle-check"></i> Approved &amp; Enrolled</span>
              </div>
              <p class="text-muted text-xs mt-1" style="margin:0;">
                Approved by Principal &amp; Vice Principal and directly integrated into the respective class teacher's active student roster.
              </p>
            </div>
          </div>
          <span class="portal-badge badge-primary" style="font-weight:700;">${admissionsList.length} Admitted Student${admissionsList.length > 1 ? 's' : ''}</span>
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:1rem;">
          ${admissionsList.map(item => {
            const studentName = item.studentName || item.name;
            const targetCode = normalizeClassForTeacher(item.classCode || item.class);
            const admNo = item.admNo || item.enrolledAdmNo || 'SV-0501';
            const matchedStudent = state.students.find(s => (s.admNo && s.admNo === admNo) || (s.name && s.name.toLowerCase() === studentName.toLowerCase()));
            const roll = matchedStudent ? matchedStudent.roll : (item.rollNo || 801);
            const teacherName = item.classTeacher || 'Assigned Faculty';

            return `
              <div style="background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:1.1rem; display:flex; flex-direction:column; justify-content:space-between; box-shadow:0 2px 6px rgba(0,0,0,0.03);">
                <div>
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.5rem; margin-bottom:0.6rem;">
                    <div>
                      <div style="font-size:1.05rem; font-weight:800; color:var(--color-text-dark);">${studentName}</div>
                      <div style="display:flex; align-items:center; gap:0.4rem; margin-top:0.25rem; flex-wrap:wrap;">
                        <span class="portal-badge badge-primary" style="font-size:0.75rem; font-weight:700;">Class ${targetCode}</span>
                        <span class="portal-badge badge-success" style="font-size:0.75rem; font-weight:700;">Adm: ${admNo}</span>
                        <span class="portal-badge" style="background:#f1f5f9; color:#475569; font-size:0.75rem; font-weight:700;">Roll #${roll}</span>
                      </div>
                    </div>
                    <div style="width:38px; height:38px; border-radius:50%; background:var(--color-primary); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1.05rem; flex-shrink:0;">
                      ${studentName.split(' ').pop()[0] || 'S'}
                    </div>
                  </div>

                  <div style="font-size:0.83rem; color:var(--color-text-muted); line-height:1.5; margin-bottom:0.75rem; background:var(--color-bg-subtle, #f8fafc); padding:0.6rem 0.75rem; border-radius:6px; border:1px solid #f1f5f9;">
                    <div><strong>Class Teacher:</strong> <span style="color:var(--color-text-dark); font-weight:600;">${teacherName}</span></div>
                    <div><strong>Parent:</strong> ${item.parent || 'Parent / Guardian'} &bull; <a href="tel:${item.phone}" style="color:var(--color-primary); font-weight:600;"><i class="fa-solid fa-phone"></i> ${item.phone || '—'}</a></div>
                  </div>
                </div>

                <div style="display:flex; gap:0.5rem; margin-top:0.25rem;">
                  <button type="button" class="btn btn-primary btn-sm" style="flex:1;" onclick="teacherApp.viewEnrolledStudentInClass('${targetCode}', ${roll})">
                    <i class="fa-solid fa-user-graduate"></i> View in Class Roster
                  </button>
                  <button type="button" class="btn btn-secondary btn-sm" onclick="teacherApp.viewStudentDossier(${roll})" title="View Student Dossier">
                    <i class="fa-regular fa-id-badge"></i> Dossier
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function viewEnrolledStudentInClass(classCode, roll) {
    navigateTo('students', 'list');
    selectStudentClass(classCode);
    showToast(`Navigated to Class ${classCode} Roster for newly admitted student (Roll #${roll})`, 'info');
  }

  function syncAdmittedStudentsFromStorage(isLiveBroadcast = false) {
    try {
      const admissionsList = [];

      // 1. sv_teacher_new_admissions
      const rawTeacherAdm = localStorage.getItem('sv_teacher_new_admissions');
      if (rawTeacherAdm) {
        try {
          const list = JSON.parse(rawTeacherAdm);
          if (Array.isArray(list)) admissionsList.push(...list);
        } catch (e) {}
      }

      // 2. sv_enrolled_students
      const rawEnrolled = localStorage.getItem('sv_enrolled_students');
      if (rawEnrolled) {
        try {
          const list = JSON.parse(rawEnrolled);
          if (Array.isArray(list)) {
            list.forEach(item => {
              if (!admissionsList.some(a => a.admNo === item.admNo || (a.appId && a.appId === item.admissionAppId))) {
                admissionsList.push({
                  appId: item.admissionAppId,
                  admNo: item.admNo,
                  studentName: item.name,
                  class: item.class,
                  classCode: normalizeClassForTeacher(item.class),
                  rollNo: item.rollNo,
                  parent: item.parent,
                  phone: item.phone,
                  enrolledAt: item.enrolledAt,
                  classTeacher: item.classTeacher
                });
              }
            });
          }
        } catch (e) {}
      }

      // 3. sv_applications
      const rawApps = localStorage.getItem('sv_applications');
      if (rawApps) {
        try {
          const list = JSON.parse(rawApps);
          if (Array.isArray(list)) {
            list.forEach(app => {
              const isApproved = (app.status || '').toLowerCase().includes('approved');
              if (isApproved) {
                const sName = app.name || app.studentName;
                if (!admissionsList.some(a => (a.appId && a.appId === app.appId) || (a.admNo && a.admNo === app.enrolledAdmNo))) {
                  admissionsList.push({
                    appId: app.appId || app.applicationNumber,
                    admNo: app.enrolledAdmNo || 'SV-0501',
                    studentName: sName,
                    class: app.class || app.grade,
                    classCode: normalizeClassForTeacher(app.class || app.grade),
                    rollNo: app.rollNo,
                    parent: app.parent || app.parentName,
                    phone: app.phone,
                    enrolledAt: app.approvedAt || new Date().toISOString(),
                    classTeacher: app.assignedTeacher
                  });
                }
              }
            });
          }
        } catch (e) {}
      }

      if (admissionsList.length === 0) return;

      let hasNewAddition = false;

      admissionsList.forEach(item => {
        const studentName = (item.studentName || item.name || '').trim();
        if (!studentName) return;

        const targetCode = normalizeClassForTeacher(item.classCode || item.class);
        const admNo = item.admNo || item.enrolledAdmNo || 'SV-0501';

        // Check if student already in state.students
        let existing = state.students.find(s => 
          (s.admNo && s.admNo === admNo) || 
          (s.name && s.name.toLowerCase() === studentName.toLowerCase() && (s.class === targetCode || s.class === item.class))
        );

        if (!existing) {
          let maxRoll = 0;
          state.students.forEach(s => {
            if (s.class === targetCode) {
              const r = parseInt(s.roll, 10);
              if (!isNaN(r) && r > maxRoll) maxRoll = r;
            }
          });

          const baseRolls = {
            '10A': 1032,
            '9B': 940,
            '8A': 842,
            '7C': 738,
            '6A': 600,
            '5A': 500,
            '4A': 400,
            '3A': 300,
            '2A': 200,
            '1A': 100,
            'PPA': 0
          };

          const calculatedRoll = parseInt(item.rollNo, 10) || (maxRoll ? maxRoll + 1 : (baseRolls[targetCode] || 800) + 1);

          const newStudentObj = {
            roll: calculatedRoll,
            admNo: admNo,
            name: studentName,
            class: targetCode,
            phone: item.phone || '9848123000',
            parent: item.parent || 'Parent',
            att: 'P',
            marks: 45,
            remarks: `Direct admission confirmed by Principal/VP. Enrolled in Class ${targetCode} (Adm No: ${admNo}).`
          };

          state.students.unshift(newStudentObj);
          hasNewAddition = true;

          // Ensure class exists in state.classes and update strength
          let cls = state.classes.find(c => c.code === targetCode || c.id === targetCode.toLowerCase());
          if (!cls) {
            cls = {
              id: targetCode.toLowerCase(),
              code: targetCode,
              name: `Class ${targetCode}`,
              isClassTeacher: true,
              roleTitle: 'Class Teacher Assigned Section',
              subject: 'Curriculum & Student Onboarding',
              strength: 1,
              room: item.assignedTeacherRoom || 'Classroom Wing',
              timing: 'Period 1 (08:45 AM - 09:30 AM)',
              avgScore: '86.0%',
              topper: studentName
            };
            state.classes.push(cls);
          } else {
            cls.strength = (cls.strength || 0) + 1;
          }

          updateClassFilterUI(targetCode);

          // Add onboarding task
          const taskId = 'new-adm-' + (item.appId || admNo);
          if (!state.pendingTasks.some(t => t.id === taskId)) {
            state.pendingTasks.unshift({
              id: taskId,
              title: `Complete class onboarding & diary issuance: ${studentName} (${targetCode})`,
              meta: `New Admission • Adm No: ${admNo} • Roll #${calculatedRoll}`,
              badge: 'due-today',
              badgeText: 'New Student',
              done: false
            });
          }

          if (isLiveBroadcast) {
            showToast(`🎉 New Student Admitted: ${studentName} has been enrolled in ${targetCode} (Adm No: ${admNo}, Roll #${calculatedRoll}) and added to your class roster!`, 'success');
          }
        }
      });

      // Update total students metric
      state.teacher.totalStudents = state.students.length;
      const countPill = document.getElementById('studentRosterCountBadge');
      if (countPill) countPill.textContent = `${state.students.length} Students`;

      const studentMetric = document.querySelector('.metrics-quad .metric-card[onclick*="students"] .metric-value');
      if (studentMetric) studentMetric.textContent = state.students.length;

      renderDashboardNewAdmissionsBox(admissionsList);

      filterStudentList();
      renderTasks();
      updateAttendanceBadges();

    } catch (err) {
      console.warn('Error syncing admitted students to teacher portal:', err);
    }
  }


  function loadSavedProfile() {
    try {
      const activeTeacherId = sessionStorage.getItem('sv_active_teacher_id') || 'SV200005';
      let raw = localStorage.getItem('sv_teacher_profile');
      let profile = raw ? JSON.parse(raw) : null;

      // If no local teacher profile or it belongs to a different school id, load from authorized faculty directory
      if (!profile || (profile.schoolId && profile.schoolId.toUpperCase() !== activeTeacherId.toUpperCase())) {
        try {
          const storedAuth = localStorage.getItem('sv_authorized_faculty');
          if (storedAuth) {
            const list = JSON.parse(storedAuth);
            const matched = Array.isArray(list) ? list.find(f => f.id && f.id.toUpperCase() === activeTeacherId.toUpperCase()) : null;
            if (matched) {
              profile = {
                name: matched.name,
                schoolId: matched.id,
                gender: matched.gender || 'Female',
                dob: matched.dob || '1990-05-15',
                phone: matched.phone || '+91 98481 23456',
                personalEmail: matched.personalEmail || 'anjali.faculty@gmail.com',
                officialEmail: matched.email || matched.officialEmail || 'anjali@srividya.edu',
                address: matched.address || 'Flat 402, Sri Sai Balaji Enclave, Main Road, Guntur, AP - 522002',
                blood: matched.blood || 'A+',
                emergency: matched.emergency || '+91 98480 99887',
                department: matched.department || matched.subject || 'Secondary Mathematics',
                designation: matched.role || 'Senior Faculty & Grade 8A Class Teacher',
                qualification: matched.qualification || 'M.Sc (Mathematics), B.Ed',
                experience: matched.exp || matched.experience || '9 Years',
                joinDate: matched.joinDate || '12-June-2019',
                allocatedClasses: matched.allocatedClasses || `${matched.subject || 'Mathematics'} (Class 8A, Class 9B, Class 10A Remedial)`,
                bio: matched.bio || 'Senior Mathematics Educator with over 9 years of teaching experience. Passionate about interactive problem solving, conceptual clarity, and fostering analytical confidence among students.',
                aadhaar: matched.aadhaar || '5482 1920 3847',
                pan: matched.pan || 'ABCDE1234F',
                udise: matched.udise || 'AP-FAC-2017-8821',
                aadhaarMobile: matched.aadhaarMobile || matched.phone || '+91 98481 23456',
                bankName: matched.bankName || 'State Bank of India (SBI)',
                accountHolder: matched.accountHolder || matched.name,
                accountNumber: matched.accountNumber || '309812456789',
                ifsc: matched.ifsc || 'SBIN0002145',
                branch: matched.branch || 'Arundelpet Branch, Guntur',
                accountType: matched.accountType || 'Savings (Salary)'
              };
            }
          }
        } catch (authErr) {}
      }

      if (!profile) {
        profile = {
          name: 'Ms. Anjali',
          schoolId: activeTeacherId,
          gender: 'Female',
          dob: '1990-05-15',
          phone: '+91 98481 23456',
          personalEmail: 'anjali.faculty@gmail.com',
          officialEmail: 'anjali@srividya.edu',
          address: 'Flat 402, Sri Sai Balaji Enclave, Main Road, Guntur, AP - 522002',
          blood: 'A+',
          emergency: '+91 98480 99887',
          // Professional
          department: 'Secondary Mathematics',
          designation: 'Senior Faculty & Grade 8A Class Teacher',
          qualification: 'M.Sc (Mathematics), B.Ed',
          experience: '9 Years',
          joinDate: '12-June-2019',
          allocatedClasses: 'Mathematics (Class 8A, Class 9B, Class 10A Remedial)',
          bio: 'Senior Mathematics Educator with over 9 years of teaching experience. Passionate about interactive problem solving, conceptual clarity, and fostering analytical confidence among students.',
          // Aadhaar & Identity
          aadhaar: '5482 1920 3847',
          pan: 'ABCDE1234F',
          udise: 'AP-FAC-2017-8821',
          aadhaarMobile: '+91 98481 23456',
          // Bank Details
          bankName: 'State Bank of India (SBI)',
          accountHolder: 'Ms. Anjali',
          accountNumber: '309812456789',
          ifsc: 'SBIN0002145',
          branch: 'Arundelpet Branch, Guntur',
          accountType: 'Savings (Salary)'
        };
      }

      state.teacher.name = profile.name;
      state.teacher.role = profile.designation || profile.motto || 'Class Teacher – Grade 8A';

      // Update Dashboard welcome banner with dynamic Indian Standard Time salutation
      const now = new Date();
      const istHour = parseInt(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', hour: 'numeric', hour12: false }).format(now), 10);
      const salutation = istHour >= 4 && istHour < 12 ? 'Good Morning' : (istHour >= 12 && istHour < 17 ? 'Good Afternoon' : 'Good Evening');
      const bannerH1 = document.querySelector('.teacher-welcome-banner .tw-title');
      if (bannerH1) bannerH1.textContent = `${salutation}, ${profile.name}`;

      const bannerSub = document.querySelector('.teacher-welcome-banner .tw-subtitle');
      if (bannerSub) bannerSub.textContent = profile.designation || 'Class Teacher – Grade 8A';

      // Update Top Header active text
      const headerActiveStrong = document.querySelector('.portal-header .text-primary');
      if (headerActiveStrong && headerActiveStrong.closest('.header-right')) {
        headerActiveStrong.textContent = `${profile.name} (${profile.department || 'Mathematics'})`;
      }

      // Update Sidebar user card
      const sidebarName = document.getElementById('teacherUserName');
      if (sidebarName) sidebarName.textContent = profile.name;

      // Update Profile Hero elements
      const heroName = document.getElementById('profTeacherHeroName');
      if (heroName) heroName.textContent = profile.name;

      const heroRole = document.getElementById('profTeacherHeroRole');
      if (heroRole) heroRole.innerHTML = `<i class="fa-solid fa-graduation-cap"></i> ${profile.designation || 'Senior Faculty'} • ${profile.department || 'Mathematics'}`;

      const heroId = document.getElementById('profHeroSchoolId');
      if (heroId) heroId.innerHTML = `<i class="fa-solid fa-id-badge"></i> School ID: ${profile.schoolId || activeTeacherId}`;

      // Fill Personal Tab
      if (document.getElementById('profTeacherName')) document.getElementById('profTeacherName').value = profile.name;
      if (document.getElementById('profSchoolId')) document.getElementById('profSchoolId').value = profile.schoolId || activeTeacherId;
      if (document.getElementById('profTeacherGender')) document.getElementById('profTeacherGender').value = profile.gender || 'Female';
      if (document.getElementById('profTeacherDob')) document.getElementById('profTeacherDob').value = profile.dob || '1990-05-15';
      if (document.getElementById('profTeacherBlood')) document.getElementById('profTeacherBlood').value = profile.blood || 'A+';
      if (document.getElementById('profTeacherPhone')) document.getElementById('profTeacherPhone').value = profile.phone || '';
      if (document.getElementById('profTeacherPersonalEmail')) document.getElementById('profTeacherPersonalEmail').value = profile.personalEmail || '';
      if (document.getElementById('profTeacherOfficialEmail')) document.getElementById('profTeacherOfficialEmail').value = profile.officialEmail || '';
      if (document.getElementById('profTeacherEmergency')) document.getElementById('profTeacherEmergency').value = profile.emergency || '';
      if (document.getElementById('profTeacherAddress')) document.getElementById('profTeacherAddress').value = profile.address || '';

      // Fill Professional Tab
      if (document.getElementById('profDept')) document.getElementById('profDept').value = profile.department || 'Secondary Mathematics';
      const designationField = document.getElementById('profDesignation');
      if (designationField) {
        const designation = profile.designation || 'Senior Faculty';
        if (!Array.from(designationField.options).some(option => option.value === designation)) {
          const customOption = document.createElement('option');
          customOption.value = designation;
          customOption.textContent = `${designation} (Saved)`;
          designationField.appendChild(customOption);
        }
        designationField.value = designation;
      }
      if (document.getElementById('profQualification')) document.getElementById('profQualification').value = profile.qualification || 'M.Sc, B.Ed';
      if (document.getElementById('profExperience')) document.getElementById('profExperience').value = profile.experience || '9 Years';
      if (document.getElementById('profJoinDate')) document.getElementById('profJoinDate').value = profile.joinDate || '12-June-2019';
      if (document.getElementById('profAllocatedClasses')) document.getElementById('profAllocatedClasses').value = profile.allocatedClasses || '';
      if (document.getElementById('profTeacherBio')) document.getElementById('profTeacherBio').value = profile.bio || '';

      // Fill Aadhaar / Identity Tab
      if (document.getElementById('profAadhaarNumber')) document.getElementById('profAadhaarNumber').value = profile.aadhaar || '5482 1920 3847';
      if (document.getElementById('profPanNumber')) document.getElementById('profPanNumber').value = profile.pan || 'ABCDE1234F';
      if (document.getElementById('profUdiseCode')) document.getElementById('profUdiseCode').value = profile.udise || 'AP-FAC-2017-8821';
      if (document.getElementById('profAadhaarMobile')) document.getElementById('profAadhaarMobile').value = profile.aadhaarMobile || profile.phone || '';

      // Fill Bank Tab
      if (document.getElementById('profBankName')) document.getElementById('profBankName').value = profile.bankName || 'State Bank of India (SBI)';
      if (document.getElementById('profAccountHolder')) document.getElementById('profAccountHolder').value = profile.accountHolder || profile.name || '';
      if (document.getElementById('profAccountNumber')) document.getElementById('profAccountNumber').value = profile.accountNumber || '309812456789';
      if (document.getElementById('profIfscCode')) document.getElementById('profIfscCode').value = profile.ifsc || 'SBIN0002145';
      if (document.getElementById('profBranchName')) document.getElementById('profBranchName').value = profile.branch || 'Arundelpet Branch, Guntur';
      if (document.getElementById('profAccountType')) document.getElementById('profAccountType').value = profile.accountType || 'Savings (Salary)';

      // Fill Security Badges
      const schoolBadge = document.getElementById('secSchoolIdBadge');
      if (schoolBadge) schoolBadge.textContent = profile.schoolId || activeTeacherId;
      const lastPass = document.getElementById('secLastPassUpdated');
      if (lastPass) {
        const savedDate = localStorage.getItem('sv_last_pass_change_' + (profile.schoolId || activeTeacherId).toUpperCase());
        lastPass.textContent = savedDate ? `Updated on ${savedDate}` : 'Default (SriVidya@2026)';
      }
    } catch (e) {
      console.error('Error loading teacher profile:', e);
    }
  }

  function resetProfile() {
    loadSavedProfile();
    showToast('Profile form reset to saved values', 'info');
  }

  function saveProfile(e) {
    if (e && e.preventDefault) e.preventDefault();
    const activeTeacherId = sessionStorage.getItem('sv_active_teacher_id') || 'SV200005';
    const data = {
      name: (document.getElementById('profTeacherName')?.value || 'Ms. Anjali').trim(),
      schoolId: document.getElementById('profSchoolId')?.value || activeTeacherId,
      gender: document.getElementById('profTeacherGender')?.value || 'Female',
      dob: document.getElementById('profTeacherDob')?.value || '1990-05-15',
      phone: (document.getElementById('profTeacherPhone')?.value || '').trim(),
      personalEmail: (document.getElementById('profTeacherPersonalEmail')?.value || '').trim(),
      officialEmail: (document.getElementById('profTeacherOfficialEmail')?.value || '').trim(),
      address: (document.getElementById('profTeacherAddress')?.value || '').trim(),
      blood: document.getElementById('profTeacherBlood')?.value || 'A+',
      emergency: (document.getElementById('profTeacherEmergency')?.value || '').trim(),
      // Professional
      department: (document.getElementById('profDept')?.value || 'Secondary Mathematics').trim(),
      designation: (document.getElementById('profDesignation')?.value || 'Senior Faculty').trim(),
      qualification: (document.getElementById('profQualification')?.value || 'M.Sc, B.Ed').trim(),
      experience: (document.getElementById('profExperience')?.value || '9 Years').trim(),
      joinDate: (document.getElementById('profJoinDate')?.value || '12-June-2019').trim(),
      allocatedClasses: (document.getElementById('profAllocatedClasses')?.value || '').trim(),
      bio: (document.getElementById('profTeacherBio')?.value || '').trim(),
      // Identity
      aadhaar: (document.getElementById('profAadhaarNumber')?.value || '').trim(),
      pan: (document.getElementById('profPanNumber')?.value || '').trim(),
      udise: (document.getElementById('profUdiseCode')?.value || '').trim(),
      aadhaarMobile: (document.getElementById('profAadhaarMobile')?.value || '').trim(),
      // Bank
      bankName: (document.getElementById('profBankName')?.value || '').trim(),
      accountHolder: (document.getElementById('profAccountHolder')?.value || '').trim(),
      accountNumber: (document.getElementById('profAccountNumber')?.value || '').trim(),
      ifsc: (document.getElementById('profIfscCode')?.value || '').trim(),
      branch: (document.getElementById('profBranchName')?.value || '').trim(),
      accountType: document.getElementById('profAccountType')?.value || 'Savings (Salary)'
    };

    localStorage.setItem('sv_teacher_profile', JSON.stringify(data));

    // =========================================================================
    // SYNC DIRECTLY TO PRINCIPAL & VICE PRINCIPAL ROSTER / DASHBOARD DIRECTORY
    // =========================================================================
    try {
      let facultyList = [];
      const stored = localStorage.getItem('sv_authorized_faculty');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) facultyList = parsed;
        } catch (e) {}
      }

      if (facultyList.length === 0 && window.PortalAuth && typeof window.PortalAuth.getAuthorizedFaculty === 'function') {
        facultyList = window.PortalAuth.getAuthorizedFaculty();
      }

      const lookupId = (data.schoolId || activeTeacherId || 'SV200005').trim().toUpperCase();
      let matched = facultyList.find(f => (f.id && f.id.toUpperCase() === lookupId));

      if (!matched && (data.officialEmail || data.personalEmail)) {
        matched = facultyList.find(f => {
          const pEmail = (f.personalEmail || '').toLowerCase();
          const oEmail = (f.email || '').toLowerCase();
          return (data.officialEmail && oEmail === data.officialEmail.toLowerCase()) ||
                 (data.personalEmail && pEmail === data.personalEmail.toLowerCase());
        });
      }

      // If still not matched and lookupId is default SV200005, match SV200005
      if (!matched) {
        matched = facultyList.find(f => f.id === 'SV200005');
      }

      const nowFormatted = new Date().toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

      if (matched) {
        matched.name = data.name;
        matched.role = data.designation || matched.role;
        matched.qualification = data.qualification || matched.qualification;
        matched.exp = data.experience || matched.exp;
        matched.subject = data.department || matched.subject;
        matched.phone = data.phone || matched.phone;
        matched.email = data.officialEmail || matched.email;
        matched.personalEmail = data.personalEmail || matched.personalEmail;
        matched.gender = data.gender;
        matched.dob = data.dob;
        matched.blood = data.blood;
        matched.address = data.address;
        matched.emergency = data.emergency;
        matched.department = data.department;
        matched.allocatedClasses = data.allocatedClasses;
        matched.bio = data.bio;
        matched.joinDate = data.joinDate;
        matched.aadhaar = data.aadhaar;
        matched.pan = data.pan;
        matched.udise = data.udise;
        matched.aadhaarMobile = data.aadhaarMobile;
        matched.bankName = data.bankName;
        matched.accountHolder = data.accountHolder;
        matched.accountNumber = data.accountNumber;
        matched.ifsc = data.ifsc;
        matched.branch = data.branch;
        matched.accountType = data.accountType;
        matched.lastProfileUpdate = nowFormatted;
        matched.profileSynced = true;
      } else {
        facultyList.push({
          id: lookupId,
          name: data.name,
          role: data.designation || 'Faculty Member',
          qualification: data.qualification || 'M.Sc, B.Ed',
          exp: data.experience || '5 Years',
          subject: data.department || 'General',
          status: 'Active',
          phone: data.phone,
          email: data.officialEmail,
          personalEmail: data.personalEmail,
          gender: data.gender,
          dob: data.dob,
          blood: data.blood,
          address: data.address,
          emergency: data.emergency,
          department: data.department,
          allocatedClasses: data.allocatedClasses,
          bio: data.bio,
          joinDate: data.joinDate,
          aadhaar: data.aadhaar,
          pan: data.pan,
          udise: data.udise,
          aadhaarMobile: data.aadhaarMobile,
          bankName: data.bankName,
          accountHolder: data.accountHolder,
          accountNumber: data.accountNumber,
          ifsc: data.ifsc,
          branch: data.branch,
          accountType: data.accountType,
          lastProfileUpdate: nowFormatted,
          profileSynced: true
        });
      }

      localStorage.setItem('sv_authorized_faculty', JSON.stringify(facultyList));
      localStorage.setItem('sv_faculty_last_sync', Date.now().toString());

      // If portalApp exists in current window (e.g. single tab SPA test)
      if (typeof window.portalApp !== 'undefined' && typeof window.portalApp.syncFacultyFromStorage === 'function') {
        window.portalApp.syncFacultyFromStorage();
      }
    } catch (syncErr) {
      console.error('Failed to sync profile changes to management registry:', syncErr);
    }

    loadSavedProfile();
    showToast('Profile updated & synchronized with Principal and Vice Principal dashboard!', 'success');
  }


  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API
  
  // =========================================================================
  // FOCUSED TEACHING WORKSPACE SUBVIEW HANDLERS
  // =========================================================================

  function renderMyClassesSubTab(subKey) {
    document.querySelectorAll('.my-classes-subview').forEach(p => p.style.display = 'none');
    
    // Sync tab strip buttons
    const strip = document.getElementById('myClassesTabStrip');
    if (strip) {
      strip.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-sub') === subKey);
      });
    }

    if (subKey === 'classes') {
      const p = document.getElementById('subtab-classes-panel');
      if (p) p.style.display = 'block';
      renderClassesGrid();
    } else if (subKey === 'roster') {
      const p = document.getElementById('subtab-roster-panel');
      if (p) p.style.display = 'block';
      renderClassListRoster('8A');
    } else if (subKey === 'profiles') {
      const p = document.getElementById('subtab-profiles-panel');
      if (p) p.style.display = 'block';
      searchStudentProfile('804');
    } else if (subKey === 'parents') {
      const p = document.getElementById('subtab-parents-panel');
      if (p) p.style.display = 'block';
      renderParentContactsTable();
    }
  }

  function renderClassesGrid() {
    const grid = document.getElementById('assignedClassesCardsGrid');
    if (!grid) return;
    grid.innerHTML = state.classes.map(c => `
      <div class="col-md-6 col-lg-3">
        <div class="card p-3 h-100" style="border-top: 3px solid #2563EB;">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="badge ${c.isClassTeacher ? 'badge-primary' : 'badge-info'}">${c.isClassTeacher ? 'Class Teacher' : 'Subject Faculty'}</span>
            <small class="text-muted">${c.strength} Students</small>
          </div>
          <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.25rem;">${c.name}</h3>
          <p style="font-size: 0.85rem; color: var(--color-text-muted); margin-bottom: 0.5rem;">${c.subject}</p>
          <div style="font-size: 0.8rem; color: var(--color-text-muted); margin-bottom: 0.75rem;">
            <div><i class="fa-solid fa-location-dot"></i> ${c.room}</div>
            <div><i class="fa-solid fa-clock"></i> ${c.timing}</div>
          </div>
          <div class="d-flex gap-2 mt-auto">
            <button class="btn btn-primary btn-xs flex-fill" onclick="teacherApp.switchSubTab('my-classes', 'roster')">
              <i class="fa-solid fa-users"></i> Roster
            </button>
            <button class="btn btn-secondary btn-xs flex-fill" onclick="teacherApp.openModal('markAttendanceModal')">
              <i class="fa-solid fa-clipboard-check"></i> Attendance
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  function renderClassListRoster(classCode) {
    const tbody = document.getElementById('classListTableBody');
    if (!tbody) return;
    const list = state.students.filter(s => s.class === classCode);
    tbody.innerHTML = list.map(s => `
      <tr>
        <td><strong>${s.roll}</strong></td>
        <td><strong>${s.name}</strong></td>
        <td><span class="badge badge-info">Class ${s.class}</span></td>
        <td><strong style="color: #059669;">96.5%</strong></td>
        <td><span class="badge badge-success">Good Progress</span></td>
        <td>
          <button class="btn btn-secondary btn-xs" onclick="teacherApp.searchStudentProfile('${s.roll}')">
            <i class="fa-solid fa-user"></i> Profile
          </button>
        </td>
      </tr>
    `).join('');
  }

  function renderParentContactsTable() {
    const tbody = document.getElementById('parentContactsTableBody');
    if (!tbody) return;
    const sample = state.students.slice(0, 8);
    tbody.innerHTML = sample.map(s => `
      <tr>
        <td><strong>${s.name}</strong></td>
        <td>Class ${s.class} (Roll #${s.roll})</td>
        <td><strong>Parent of ${s.name.split(' ')[1] || s.name}</strong></td>
        <td><i class="fa-solid fa-phone text-primary"></i> +91 ${s.phone}</td>
        <td><i class="fa-solid fa-phone-volume text-emerald"></i> +91 93985xxxxx</td>
        <td>
          <button class="btn btn-primary btn-xs" onclick="teacherApp.navigateTo('communication', 'parent-messages')">
            <i class="fa-solid fa-message"></i> Message
          </button>
        </td>
      </tr>
    `).join('');
  }

  function searchStudentProfile(query) {
    const card = document.getElementById('studentProfilePreviewCard');
    if (!card) return;
    query = String(query).toLowerCase();
    const s = state.students.find(st => String(st.roll).toLowerCase().includes(query) || st.name.toLowerCase().includes(query)) || state.students[3];
    card.innerHTML = `
      <div style="background: var(--color-bg-surface, #f8fafc); border: 1px solid var(--color-border, #e2e8f0); border-radius: 10px; padding: 1.25rem;">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div class="d-flex align-items-center gap-3">
            <div style="width: 52px; height: 52px; background: #2563EB; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700;">
              ${s.name.charAt(0)}
            </div>
            <div>
              <h4 style="margin: 0; font-size: 1.15rem; font-weight: 700;">${s.name}</h4>
              <p style="margin: 0; font-size: 0.85rem; color: var(--color-text-muted);">Roll Number: ${s.roll} • Class ${s.class} (Mathematics)</p>
            </div>
          </div>
          <span class="badge badge-success" style="font-size: 0.85rem;"><i class="fa-solid fa-star"></i> Rank #1 in Math</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; margin-bottom: 1rem; text-align: center;">
          <div class="p-2" style="background:#fff; border-radius:6px; border:1px solid #e2e8f0;">
            <small class="text-muted">Attendance</small>
            <div class="fw-bold text-emerald">98.2% (Present)</div>
          </div>
          <div class="p-2" style="background:#fff; border-radius:6px; border:1px solid #e2e8f0;">
            <small class="text-muted">Unit Test 2 Marks</small>
            <div class="fw-bold text-primary">${s.marks} / 50 (Grade A1)</div>
          </div>
          <div class="p-2" style="background:#fff; border-radius:6px; border:1px solid #e2e8f0;">
            <small class="text-muted">Blood Group</small>
            <div class="fw-bold">B+ Positive</div>
          </div>
          <div class="p-2" style="background:#fff; border-radius:6px; border:1px solid #e2e8f0;">
            <small class="text-muted">Emergency Parent Contact</small>
            <div class="fw-bold text-primary">+91 ${s.phone}</div>
          </div>
        </div>
        <div style="font-size: 0.85rem; color: var(--color-text-muted);">
          <strong>Teacher Remarks:</strong> ${s.remarks}
        </div>
      </div>
    `;
  }

  function renderAttendanceEnhancedSubTab(subKey) {
    const corrPanel = document.getElementById('subview-attendance-corrections');
    if (corrPanel) {
      corrPanel.style.display = (subKey === 'corrections') ? 'block' : 'none';
    }
  }

  function submitAttendanceCorrection() {
    const student = document.getElementById('corrStudentInput')?.value || '';
    const type = document.getElementById('corrTypeSelect')?.value || '';
    showToast(`Attendance correction slip submitted for '${student}' (${type}). Sent to Principal & Office Desk for approval.`, 'success');
    document.getElementById('attendanceCorrectionForm')?.reset();
  }

  function renderAcademicsEnhancedSubTab(subKey) {
    showToast(`Academics & Assignments view: ${subKey.toUpperCase()}`, 'info');
  }

  function renderExaminationsEnhancedSubTab(subKey) {
    showToast(`Examinations & Marks view: ${subKey.toUpperCase()}`, 'info');
  }

  function renderCommunicationEnhancedSubTab(subKey) {
    showToast(`Communication view: ${subKey.toUpperCase()}`, 'info');
  }

  function renderTimetableEnhancedSubTab(subKey) {
    showToast(`Timetable & Leave view: ${subKey.toUpperCase()}`, 'info');
  }

  return {
    renderMyClassesSubTab,
    renderClassListRoster,
    renderParentContactsTable,
    searchStudentProfile,
    submitAttendanceCorrection,

    updateISTClock,
    switchProfileTab,
    toggleFieldPass,
    checkPassStrength,
    checkPassMatch,
    handleSecurityPasswordChange,
    saveProfile,
    init,
    loadLiveData,
    navigateTo,
    checkModuleAccess,
    requestModuleAccess,
    unlockAllTeacherModulesForFaculty,
    getFacultyPermissions,
    getRawTeacherPermissions,
    applyTeacherDynamicPermissions,
    switchSubTab,
    switchClassTab,
    toggleTask,
    filterStudentList,
    selectStudentClass,
    renderClassInfoBanner,
    filterDashboardStudents,
    setAttendance,
    markAllPresent,
    saveDailyAttendance,
    confirmQuickAttendance,
    updateMarks,
    saveMarks,
    handleCreateHomework,
    handleApplyLeave,
    handlePostNotice,
    replyParent,
    scrollToTasks,
    openModal,
    closeModal,
    showToast,
    saveProfile,
    resetProfile,
    loadSavedProfile,
    viewStudentDossier,
    syncAdmittedStudentsFromStorage,
    viewEnrolledStudentInClass,
    renderDashboardNewAdmissionsBox,
    contactParentFromDossier,
    promptWithdrawStudent,
    notifyNonClassTeacherAttempt,
    confirmWithdrawStudent
  };

})();
window.teacherApp = teacherApp;
window.switchProfileTab = teacherApp.switchProfileTab;


// Unified Portals Hub Flyout Toggle (All Portals in One Place)
document.addEventListener('DOMContentLoaded', function () {
  const btnPortalsHub = document.getElementById('btnPortalsHub');
  const portalsHubFlyout = document.getElementById('portalsHubFlyout');
  if (btnPortalsHub && portalsHubFlyout) {
    btnPortalsHub.addEventListener('click', function (e) {
      e.stopPropagation();
      const isOpen = portalsHubFlyout.classList.toggle('active');
      btnPortalsHub.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) {
      if (!portalsHubFlyout.contains(e.target) && !btnPortalsHub.contains(e.target)) {
        portalsHubFlyout.classList.remove('active');
        btnPortalsHub.setAttribute('aria-expanded', 'false');
      }
    });
  }
});
