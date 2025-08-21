const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.json());  // POST 요청 바디를 JSON으로 파싱

// 활동 수준 계수
const activityFactors = {
  none: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9
};

// BMR 계산 함수
function calculateBMR(weight, height, age, gender) {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else if (gender === 'female') {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  } else {
    return null;
  }
}

// BMI 상태 해석 함수
function getBMIStatus(bmi) {
  if (bmi < 18.5) return "저체중";
  else if (bmi < 23) return "정상";
  else if (bmi < 25) return "과체중";
  else return "비만";
}

// BMR, TDEE, BMI 계산 API
app.post('/calculate', (req, res) => {
  const { weight, height, age, gender, activity_level } = req.body;

  if (!weight || !height || !age || !gender || !activity_level) {
    return res.status(400).json({ error: '필수 파라미터가 부족합니다.' });
  }

  // BMR 계산
  const bmr = calculateBMR(weight, height, age, gender.toLowerCase());
  if (!bmr) return res.status(400).json({ error: '잘못된 성별입니다.' });

  // 활동 수준에 따른 TDEE
  const activityFactor = activityFactors[activity_level.toLowerCase()];
  if (!activityFactor) return res.status(400).json({ error: '잘못된 활동 수준입니다.' });
  const tdee = bmr * activityFactor;

  // BMI 계산
  const heightMeter = height / 100;
  const bmi = weight / (heightMeter * heightMeter);
  const bmiStatus = getBMIStatus(bmi);

  res.json({
    bmr: parseFloat(bmr.toFixed(2)),
    tdee: parseFloat(tdee.toFixed(2)),
    bmi: parseFloat(bmi.toFixed(2)),
    bmi_status: bmiStatus
  });
});

// 서버 실행
app.listen(port, () => {
  console.log(`서버가 실행 중입니다: http://localhost:${port}`);
});
