import { Helmet } from '@dr.pogodin/react-helmet';
import GameShell, { type GameResult } from '@/components/games/GameShell';
import LevelledQuizEngine from '@/components/games/LevelledQuizEngine';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'Which food group gives us energy?', options: ['Carbohydrates','Proteins','Vitamins','Minerals'], answer: 'Carbohydrates' },
  { question: 'Which food group helps us grow and repair?', options: ['Proteins','Carbohydrates','Vitamins','Minerals'], answer: 'Proteins' },
  { question: 'Which food is a good source of protein?', options: ['Chicken','Bread','Apple','Butter'], answer: 'Chicken' },
  { question: 'Which food is a good source of carbohydrates?', options: ['Bread','Chicken','Apple','Butter'], answer: 'Bread' },
  { question: 'Which food is a good source of vitamins?', options: ['Apple','Bread','Chicken','Butter'], answer: 'Apple' },
  { question: 'Which food is a good source of fat?', options: ['Butter','Apple','Bread','Chicken'], answer: 'Butter' },
  { question: 'How many portions of fruit and vegetables should we eat each day?', options: ['5','3','7','10'], answer: '5' },
  { question: 'Which drink is the healthiest?', options: ['Water','Cola','Juice','Milk'], answer: 'Water' },
  { question: 'Which food is high in sugar?', options: ['Sweets','Broccoli','Chicken','Bread'], answer: 'Sweets' },
  { question: 'Which food is high in fibre?', options: ['Wholegrain bread','White bread','Chicken','Butter'], answer: 'Wholegrain bread' },
  { question: 'What does calcium help build?', options: ['Bones and teeth','Muscles','Blood','Skin'], answer: 'Bones and teeth' },
  { question: 'What does iron help make?', options: ['Red blood cells','Bones','Muscles','Skin'], answer: 'Red blood cells' },
];
const L2: QuizQuestion[] = [
  { question: 'What is the main function of carbohydrates?', options: ['Provide energy','Build muscles','Protect organs','Regulate body temperature'], answer: 'Provide energy' },
  { question: 'What is the main function of proteins?', options: ['Build and repair tissues','Provide energy','Protect organs','Regulate body temperature'], answer: 'Build and repair tissues' },
  { question: 'What is the main function of fats?', options: ['Store energy and insulate the body','Build muscles','Provide quick energy','Regulate body temperature'], answer: 'Store energy and insulate the body' },
  { question: 'What vitamin do we get from sunlight?', options: ['Vitamin D','Vitamin C','Vitamin A','Vitamin B'], answer: 'Vitamin D' },
  { question: 'What vitamin do we get from citrus fruits?', options: ['Vitamin C','Vitamin D','Vitamin A','Vitamin B'], answer: 'Vitamin C' },
  { question: 'What is a deficiency disease?', options: ['A disease caused by lack of a nutrient','A disease caused by too much food','A disease caused by bacteria','A disease caused by viruses'], answer: 'A disease caused by lack of a nutrient' },
  { question: 'What disease is caused by lack of Vitamin C?', options: ['Scurvy','Rickets','Anaemia','Kwashiorkor'], answer: 'Scurvy' },
  { question: 'What disease is caused by lack of Vitamin D?', options: ['Rickets','Scurvy','Anaemia','Kwashiorkor'], answer: 'Rickets' },
  { question: 'What disease is caused by lack of iron?', options: ['Anaemia','Scurvy','Rickets','Kwashiorkor'], answer: 'Anaemia' },
  { question: 'What is the BMI used for?', options: ['Measuring if someone is a healthy weight','Measuring blood pressure','Measuring heart rate','Measuring lung capacity'], answer: 'Measuring if someone is a healthy weight' },
  { question: 'What is a balanced diet?', options: ['Eating the right amounts of all food groups','Eating only healthy foods','Eating the same amount every day','Eating no fat or sugar'], answer: 'Eating the right amounts of all food groups' },
  { question: 'What is the Eatwell Guide?', options: ['A guide to eating a balanced diet','A guide to losing weight','A guide to gaining weight','A guide to eating less'], answer: 'A guide to eating a balanced diet' },
];
const L3: QuizQuestion[] = [
  { question: 'What is the glycaemic index (GI)?', options: ['A measure of how quickly food raises blood sugar','A measure of calorie content','A measure of fat content','A measure of protein content'], answer: 'A measure of how quickly food raises blood sugar' },
  { question: 'What are saturated fats mainly found in?', options: ['Animal products like butter and meat','Plant oils','Fish','Vegetables'], answer: 'Animal products like butter and meat' },
  { question: 'What are unsaturated fats mainly found in?', options: ['Plant oils, nuts and fish','Butter and meat','Dairy products','Processed foods'], answer: 'Plant oils, nuts and fish' },
  { question: 'What is the role of fibre in the diet?', options: ['Aids digestion and prevents constipation','Provides energy','Builds muscles','Strengthens bones'], answer: 'Aids digestion and prevents constipation' },
  { question: 'What is a calorie?', options: ['A unit of energy in food','A unit of fat','A unit of protein','A unit of carbohydrate'], answer: 'A unit of energy in food' },
  { question: 'What is the recommended daily calorie intake for an average adult?', options: ['2000–2500 kcal','500–1000 kcal','3000–4000 kcal','1000–1500 kcal'], answer: '2000–2500 kcal' },
  { question: 'What is kwashiorkor?', options: ['A disease caused by severe protein deficiency','A disease caused by lack of vitamin C','A disease caused by lack of iron','A disease caused by lack of vitamin D'], answer: 'A disease caused by severe protein deficiency' },
  { question: 'What is marasmus?', options: ['Severe malnutrition due to lack of calories and protein','A disease caused by lack of vitamin C','A disease caused by lack of iron','A disease caused by excess sugar'], answer: 'Severe malnutrition due to lack of calories and protein' },
  { question: 'What is the function of vitamin A?', options: ['Supports vision and immune function','Strengthens bones','Helps absorb iron','Provides energy'], answer: 'Supports vision and immune function' },
  { question: 'What is the function of vitamin K?', options: ['Helps blood clotting','Strengthens bones','Supports vision','Provides energy'], answer: 'Helps blood clotting' },
  { question: 'What is the function of potassium?', options: ['Regulates fluid balance and nerve function','Strengthens bones','Builds muscles','Provides energy'], answer: 'Regulates fluid balance and nerve function' },
  { question: 'What is the function of zinc?', options: ['Supports immune function and wound healing','Strengthens bones','Supports vision','Provides energy'], answer: 'Supports immune function and wound healing' },
];
const L4: QuizQuestion[] = [
  { question: 'What is the difference between type 1 and type 2 diabetes?', options: ['Type 1: no insulin produced; Type 2: insulin resistance','Type 1: insulin resistance; Type 2: no insulin produced','Both are caused by diet','Both are caused by genetics only'], answer: 'Type 1: no insulin produced; Type 2: insulin resistance' },
  { question: 'What is the role of insulin?', options: ['Lowers blood glucose by promoting uptake into cells','Raises blood glucose','Breaks down fat','Builds muscle'], answer: 'Lowers blood glucose by promoting uptake into cells' },
  { question: 'What is the role of glucagon?', options: ['Raises blood glucose by stimulating glycogen breakdown','Lowers blood glucose','Breaks down protein','Builds muscle'], answer: 'Raises blood glucose by stimulating glycogen breakdown' },
  { question: 'What is metabolic rate?', options: ['The rate at which the body uses energy','The rate at which food is digested','The rate at which muscles grow','The rate at which fat is stored'], answer: 'The rate at which the body uses energy' },
  { question: 'What is basal metabolic rate (BMR)?', options: ['Energy needed at rest to maintain basic body functions','Energy needed for exercise','Energy needed for digestion','Energy needed for growth'], answer: 'Energy needed at rest to maintain basic body functions' },
  { question: 'What is the role of the liver in nutrition?', options: ['Processes nutrients, stores glycogen, detoxifies','Only stores fat','Only produces bile','Only breaks down protein'], answer: 'Processes nutrients, stores glycogen, detoxifies' },
  { question: 'What is cholesterol?', options: ['A fatty substance needed for cell membranes and hormones','A type of sugar','A type of protein','A type of vitamin'], answer: 'A fatty substance needed for cell membranes and hormones' },
  { question: 'What is the difference between HDL and LDL cholesterol?', options: ['HDL is "good" (removes cholesterol); LDL is "bad" (deposits cholesterol)','HDL is "bad"; LDL is "good"','Both are equally harmful','Both are equally beneficial'], answer: 'HDL is "good" (removes cholesterol); LDL is "bad" (deposits cholesterol)' },
  { question: 'What is the role of the small intestine in digestion?', options: ['Absorbs nutrients into the bloodstream','Breaks down food mechanically','Stores food','Produces bile'], answer: 'Absorbs nutrients into the bloodstream' },
  { question: 'What is the role of the large intestine?', options: ['Absorbs water and forms faeces','Absorbs nutrients','Breaks down food','Produces digestive enzymes'], answer: 'Absorbs water and forms faeces' },
  { question: 'What is a probiotic?', options: ['Live bacteria that benefit gut health','A type of vitamin','A type of mineral','A type of fibre'], answer: 'Live bacteria that benefit gut health' },
  { question: 'What is a prebiotic?', options: ['Food that feeds beneficial gut bacteria','Live bacteria','A type of vitamin','A type of mineral'], answer: 'Food that feeds beneficial gut bacteria' },
];
const L5: QuizQuestion[] = [
  { question: 'What is the role of the microbiome in health?', options: ['Gut bacteria influence digestion, immunity and mental health','Gut bacteria only aid digestion','Gut bacteria only affect immunity','Gut bacteria have no proven health effects'], answer: 'Gut bacteria influence digestion, immunity and mental health' },
  { question: 'What is nutrigenomics?', options: ['The study of how diet interacts with genes','The study of nutrients in food','The study of genetic diseases','The study of food safety'], answer: 'The study of how diet interacts with genes' },
  { question: 'What is the concept of food security?', options: ['All people having access to sufficient, safe, nutritious food','Food being stored safely','Food being produced locally','Food being affordable'], answer: 'All people having access to sufficient, safe, nutritious food' },
  { question: 'What is the environmental impact of a meat-heavy diet?', options: ['Higher greenhouse gas emissions and land use than plant-based diets','Lower greenhouse gas emissions','No environmental impact','Less land use than plant-based diets'], answer: 'Higher greenhouse gas emissions and land use than plant-based diets' },
  { question: 'What is the role of omega-3 fatty acids?', options: ['Reduce inflammation and support brain and heart health','Provide quick energy','Build muscle','Strengthen bones'], answer: 'Reduce inflammation and support brain and heart health' },
  { question: 'What is the difference between fat-soluble and water-soluble vitamins?', options: ['Fat-soluble (A,D,E,K) are stored in the body; water-soluble (B,C) are not','Water-soluble are stored; fat-soluble are not','Both are stored in the body','Neither is stored in the body'], answer: 'Fat-soluble (A,D,E,K) are stored in the body; water-soluble (B,C) are not' },
  { question: 'What is the role of antioxidants in the diet?', options: ['Neutralise free radicals that can damage cells','Provide energy','Build muscle','Strengthen bones'], answer: 'Neutralise free radicals that can damage cells' },
  { question: 'What is the concept of energy balance?', options: ['Energy intake equals energy expenditure for weight maintenance','Energy intake always exceeds expenditure','Energy expenditure always exceeds intake','Energy balance is not related to weight'], answer: 'Energy intake equals energy expenditure for weight maintenance' },
  { question: 'What is the role of phytochemicals in the diet?', options: ['Plant compounds with potential health benefits beyond basic nutrition','Essential nutrients','A type of vitamin','A type of mineral'], answer: 'Plant compounds with potential health benefits beyond basic nutrition' },
  { question: 'What is the Mediterranean diet associated with?', options: ['Reduced risk of heart disease and longer life expectancy','Increased risk of diabetes','No proven health benefits','Higher cholesterol levels'], answer: 'Reduced risk of heart disease and longer life expectancy' },
  { question: 'What is the role of the enteric nervous system?', options: ['A network of neurons in the gut that controls digestion independently','The brain\'s control of digestion only','The immune system\'s role in digestion','The liver\'s role in digestion'], answer: 'A network of neurons in the gut that controls digestion independently' },
  { question: 'What is intermittent fasting?', options: ['Cycling between periods of eating and fasting','Eating very small amounts continuously','Fasting for long periods','Eating only one meal per day'], answer: 'Cycling between periods of eating and fasting' },
];

export default function HealthyEatingGame() {
  return (
    <>
      <Helmet>
        <title>Healthy Eating — Sodafom</title>
        <meta name="description" content="Learn about nutrition, food groups, and healthy choices!" />
        <link rel="canonical" href="https://sodafom.uk/games/healthy-eating" />
        <meta property="og:title" content="Healthy Eating — Sodafom" />
        <meta property="og:description" content="Learn about nutrition, food groups, and healthy choices!" />
        <meta property="og:url" content="https://sodafom.uk/games/healthy-eating" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://sodafom.uk/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://sodafom.uk/og-image.png" />
      </Helmet>
      <h1 className="sr-only">Healthy Eating — Science Game for Kids — Sodafom</h1>
      <GameShell title="Healthy Eating" emoji="🥦" subject="science" ageGroups={['5–7', '7–9']}>
        {(oc: (r: GameResult) => void) => (
          <LevelledQuizEngine
            gameSlug="healthy-eating"
            title="Healthy Eating"
            emoji="🥦"
            questionsByLevel={[L1, L2, L3, L4, L5]}
            accentClass="bg-primary"
            onComplete={oc}
          />
        )}
      </GameShell>
    </>
  );
}
