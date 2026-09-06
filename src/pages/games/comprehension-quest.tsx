import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'Read: "The cat sat on the mat." Where did the cat sit?', options: ['On the chair','On the mat','On the floor','On the table'], answer: 'On the mat' },
  { question: 'Read: "Tom has a red ball and a blue kite." What colour is the ball?', options: ['Blue','Green','Red','Yellow'], answer: 'Red' },
  { question: 'Read: "It was raining so Mia put on her coat." Why did Mia put on her coat?', options: ['She was cold','It was raining','She was going to school','She was tired'], answer: 'It was raining' },
  { question: 'Read: "The dog barked loudly at the postman." What did the dog do?', options: ['Ran away','Barked loudly','Sat quietly','Wagged its tail'], answer: 'Barked loudly' },
  { question: 'Read: "Sam ate an apple for lunch." What did Sam eat?', options: ['A banana','A sandwich','An apple','A biscuit'], answer: 'An apple' },
  { question: 'Read: "The sun was shining and the birds were singing." What was the weather like?', options: ['Rainy','Cloudy','Sunny','Windy'], answer: 'Sunny' },
  { question: 'Read: "Lily has three cats: Fluffy, Spot and Tiger." How many cats does Lily have?', options: ['One','Two','Three','Four'], answer: 'Three' },
  { question: 'Read: "Jack ran as fast as he could to catch the bus." Why did Jack run?', options: ['He was late for school','He wanted exercise','He was chasing a dog','He wanted to catch the bus'], answer: 'He wanted to catch the bus' },
  { question: 'Read: "The old man walked slowly with his stick." How did the old man walk?', options: ['Quickly','Slowly','Happily','Quietly'], answer: 'Slowly' },
  { question: 'Read: "Emma loves reading books about animals." What does Emma love?', options: ['Playing sport','Watching TV','Reading books about animals','Drawing pictures'], answer: 'Reading books about animals' },
  { question: 'Read: "The children played in the park until it got dark." When did they stop playing?', options: ['When it started raining','When it got dark','When they were tired','When their mum called'], answer: 'When it got dark' },
  { question: 'Read: "Ben had five sweets but gave two to his sister." How many sweets did Ben have left?', options: ['Two','Three','Four','Five'], answer: 'Three' },
];
const L2: QuizQuestion[] = [
  { question: 'Read: "The old lighthouse stood alone on the rocky cliff, its light sweeping the dark sea below." What does the lighthouse do?', options: ['It stands on a beach','Its light sweeps the sea','It is new','It is on a hill'], answer: 'Its light sweeps the sea' },
  { question: 'Read: "Maya ran as fast as her legs would carry her, her heart pounding like a drum." How does Maya feel?', options: ['Calm','Excited or scared','Tired','Happy'], answer: 'Excited or scared' },
  { question: 'Read: "The market was a riot of colour — red tomatoes, yellow bananas, purple aubergines." What is the market like?', options: ['Quiet and grey','Colourful and busy','Empty','Dark'], answer: 'Colourful and busy' },
  { question: 'Read: "Despite the rain, the children played outside, splashing in every puddle they could find." What does "despite" mean here?', options: ['Because of','Even though','Instead of','After'], answer: 'Even though' },
  { question: 'Read: "The ancient oak tree had stood in the village for three hundred years." What does "ancient" mean?', options: ['Very new','Very tall','Very old','Very small'], answer: 'Very old' },
  { question: 'Read: "She whispered so quietly that only the person next to her could hear." What does "whispered" tell us?', options: ['She spoke loudly','She spoke very quietly','She sang','She shouted'], answer: 'She spoke very quietly' },
  { question: 'Read: "The explorers were exhausted after their long trek through the jungle." What does "exhausted" mean?', options: ['Very hungry','Very tired','Very excited','Very cold'], answer: 'Very tired' },
  { question: 'Read: "The cunning fox crept silently towards the henhouse." What does "cunning" mean?', options: ['Clumsy','Clever and sneaky','Loud','Friendly'], answer: 'Clever and sneaky' },
  { question: 'Read: "The storm was relentless — it rained for three days without stopping." What does "relentless" mean?', options: ['Brief','Gentle','Never stopping','Surprising'], answer: 'Never stopping' },
  { question: 'Read: "Tom was reluctant to admit he had made a mistake." What does "reluctant" mean?', options: ['Eager','Unwilling','Happy','Confused'], answer: 'Unwilling' },
  { question: 'Read: "The scientist peered through the microscope, her eyes widening with each passing second." What can we infer?', options: ['She is bored','She has found something surprising','She is tired','She is angry'], answer: 'She has found something surprising' },
  { question: 'Read: "Not a soul stirred in the empty streets." What does this mean?', options: ['People were dancing','Nobody was around','People were sleeping','People were hiding'], answer: 'Nobody was around' },
];
const L3: QuizQuestion[] = [
  { question: 'Read: "The ancient castle loomed over the village, its crumbling towers casting long shadows." What is the mood?', options: ['Cheerful and bright','Eerie and foreboding','Calm and peaceful','Exciting and joyful'], answer: 'Eerie and foreboding' },
  { question: 'Read: "The letter had been read so many times the paper was soft as cloth." What can we infer?', options: ['The letter was new','The letter was very important to the reader','The letter was boring','The letter was short'], answer: 'The letter was very important to the reader' },
  { question: 'Read: "She was the last to arrive, as always." What does "as always" tell us?', options: ['She is usually early','She is usually late','This is the first time she was late','She is sometimes late'], answer: 'She is usually late' },
  { question: 'Read: "The twins were as different as chalk and cheese." What does this mean?', options: ['They both liked food','They were very similar','They were very different','They were the same age'], answer: 'They were very different' },
  { question: 'Read: "He swallowed hard before knocking on the door." What can we infer?', options: ['He was hungry','He was nervous','He was excited','He was angry'], answer: 'He was nervous' },
  { question: 'Read: "The room fell silent when she entered." What can we infer?', options: ['The room was always quiet','Her presence had a strong impact on the people there','The people were asleep','The people were bored'], answer: 'Her presence had a strong impact on the people there' },
  { question: 'Read: "Years of practice had made the movement second nature to her." What does "second nature" mean?', options: ['Something she had to think hard about','Something she could do automatically without thinking','Something she had learned recently','Something she found difficult'], answer: 'Something she could do automatically without thinking' },
  { question: 'Read: "Despite her fear, Amara stepped forward." What does "despite" tell us?', options: ['Because of her fear','Even though she was afraid','After her fear passed','Before she was afraid'], answer: 'Even though she was afraid' },
  { question: 'Read: "The scientist peered through the microscope, her eyes widening." What can we infer?', options: ['She is bored','She has found something surprising or exciting','She is tired','She is angry'], answer: 'She has found something surprising or exciting' },
  { question: 'Read: "He counted his coins for the third time." What can we infer?', options: ['He has lots of money','He is worried he does not have enough','He likes counting','He is bored'], answer: 'He is worried he does not have enough' },
  { question: 'Read: "She read the letter twice, then folded it carefully and put it away." What can we infer?', options: ['The letter was unimportant','The letter was important to her','She could not read it','She was bored'], answer: 'The letter was important to her' },
  { question: 'Read: "The children fell silent when the headteacher walked in." What can we infer?', options: ['They respect or fear the headteacher','They are bored','They are happy','They are eating'], answer: 'They respect or fear the headteacher' },
];
const L4 = L3;
const L5 = L3;

export default makeGame({
  slug: 'comprehension-quest',
  title: 'Comprehension Quest',
  emoji: '📖',
  subject: 'reading',
  ageGroups: ['8–10', '11–13'],
  description: 'Read the passage and answer questions to show your understanding!',
  accentClass: 'bg-primary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
