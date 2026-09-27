const { pool } = require('./db');
const problems = [
  {
    slug: 'two-sum', title: 'Two Sum',
    description: 'Read "n target" on line1, array on line2. Print indices i j such that a[i]+a[j]==target.',
    starter_code: 'import sys\ndata = sys.stdin.read().strip().split()\n# data: n, target, arr...\nprint("0 1")',
    tests: [
      { stdin: '4 9\n2 7 11 15', expected: '0 1' },
      { stdin: '3 6\n3 2 4', expected: '1 2' }
    ]
  },
  {
    slug: 'palindrome', title: 'Valid Palindrome',
    description: 'Read one line string. Print "true" if palindrome ignoring case/non-alphanumeric, else "false".',
    starter_code: 'import sys\ns = sys.stdin.read().strip()\nprint("true")',
    tests: [
      { stdin: 'A man, a plan, a canal: Panama', expected: 'true' },
      { stdin: 'race a car', expected: 'false' }
    ]
  },
  {
    slug: 'fizzbuzz', title: 'FizzBuzz',
    description: 'Read integer n. For 1..n print FizzBuzz rules, each on new line.',
    starter_code: 'import sys\nn = int(sys.stdin.read().strip())\nfor i in range(1, n+1):\n    print(i)',
    tests: [
      { stdin: '3', expected: '1\n2\nFizz' },
      { stdin: '5', expected: '1\n2\nFizz\n4\nBuzz' }
    ]
  }
];
async function seed() {
  for (const p of problems) {
    await pool.query(
      `INSERT INTO problems (slug,title,description,starter_code,tests) VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (slug) DO UPDATE SET title=$2, description=$3, starter_code=$4, tests=$5`,
      [p.slug, p.title, p.description, p.starter_code, JSON.stringify(p.tests)]
    );
  }
  console.log('seeded', problems.length);
}
module.exports = { seed };
