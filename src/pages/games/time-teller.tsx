import { makeGame } from '@/components/games/makeGame';
import type { QuizQuestion } from '@/components/games/QuizEngine';

const L1: QuizQuestion[] = [
  { question: 'What time is 3:00 in words?', options: ['Half past three','Quarter past three','Three o\'clock','Quarter to three'], answer: 'Three o\'clock' },
  { question: 'What time is 6:30 in words?', options: ['Quarter past six','Half past six','Quarter to six','Six o\'clock'], answer: 'Half past six' },
  { question: 'What time is 9:15 in words?', options: ['Quarter past nine','Half past nine','Quarter to nine','Nine o\'clock'], answer: 'Quarter past nine' },
  { question: 'What time is 4:45 in words?', options: ['Quarter past four','Half past four','Quarter to five','Quarter to four'], answer: 'Quarter to five' },
  { question: 'How many minutes in 1 hour?', options: ['30','45','60','90'], answer: '60' },
  { question: 'How many hours in 1 day?', options: ['12','18','24','36'], answer: '24' },
  { question: 'How many seconds in 1 minute?', options: ['30','45','60','100'], answer: '60' },
  { question: 'How many days in 1 week?', options: ['5','6','7','8'], answer: '7' },
  { question: 'What time is 12:00 in the middle of the day?', options: ['Midnight','Noon','Morning','Evening'], answer: 'Noon' },
  { question: 'What time is 12:00 in the middle of the night?', options: ['Noon','Midnight','Morning','Evening'], answer: 'Midnight' },
  { question: 'What time is 2:30 in words?', options: ['Quarter past two','Half past two','Quarter to two','Two o\'clock'], answer: 'Half past two' },
  { question: 'What time is 11:45 in words?', options: ['Quarter past eleven','Half past eleven','Quarter to twelve','Quarter to eleven'], answer: 'Quarter to twelve' },
];
const L2: QuizQuestion[] = [
  { question: 'What time is 3:30 in words?', options: ['Quarter past three','Half past three','Quarter to three','Three o\'clock'], answer: 'Half past three' },
  { question: 'What time is 7:15 in words?', options: ['Quarter past seven','Half past seven','Quarter to seven','Seven fifteen'], answer: 'Quarter past seven' },
  { question: 'What time is 9:45 in words?', options: ['Quarter past nine','Half past nine','Quarter to ten','Quarter to nine'], answer: 'Quarter to ten' },
  { question: 'How many minutes in 2 hours?', options: ['60','90','120','180'], answer: '120' },
  { question: 'A film starts at 14:30 and lasts 90 minutes. When does it end?', options: ['15:30','16:00','16:30','17:00'], answer: '16:00' },
  { question: 'How many seconds in 3 minutes?', options: ['60','120','180','300'], answer: '180' },
  { question: 'What is 11:50 + 25 minutes?', options: ['12:05','12:10','12:15','12:25'], answer: '12:15' },
  { question: 'A journey takes 1 hour 45 minutes. It starts at 10:20. When does it end?', options: ['11:55','12:00','12:05','12:10'], answer: '12:05' },
  { question: 'How many hours in 3 days?', options: ['36','48','60','72'], answer: '72' },
  { question: 'What is 08:45 in 12-hour clock?', options: ['8:45 am','8:45 pm','9:45 am','9:45 pm'], answer: '8:45 am' },
  { question: 'What is 20:30 in 12-hour clock?', options: ['8:30 am','8:30 pm','10:30 am','10:30 pm'], answer: '8:30 pm' },
  { question: 'A train leaves at 09:25 and arrives at 11:10. How long is the journey?', options: ['1h 35m','1h 45m','2h 5m','2h 15m'], answer: '1h 45m' },
];
const L3: QuizQuestion[] = [
  { question: 'A flight departs at 23:45 and lands 8 hours 20 minutes later. What time does it land?', options: ['07:05','08:05','08:15','07:15'], answer: '08:05' },
  { question: 'How many minutes in 3.5 hours?', options: ['180','200','210','240'], answer: '210' },
  { question: 'A shop opens at 07:30 and closes at 21:15. How long is it open?', options: ['13h 30m','13h 45m','14h 15m','14h 45m'], answer: '13h 45m' },
  { question: 'Convert 185 minutes to hours and minutes.', options: ['2h 55m','3h 5m','3h 15m','2h 45m'], answer: '3h 5m' },
  { question: 'A race starts at 10:45 and the winner finishes in 2h 37m. What time do they finish?', options: ['13:12','13:22','13:32','13:42'], answer: '13:22' },
  { question: 'How many seconds in 2 hours?', options: ['3,600','5,400','7,200','9,000'], answer: '7,200' },
  { question: 'A TV programme starts at 19:55 and lasts 1h 25m. What time does it end?', options: ['21:10','21:20','21:25','21:30'], answer: '21:20' },
  { question: 'Convert 4.25 hours to hours and minutes.', options: ['4h 15m','4h 20m','4h 25m','4h 30m'], answer: '4h 15m' },
  { question: 'A journey of 450 miles at 60 mph. How long does it take?', options: ['6h 30m','7h','7h 30m','8h'], answer: '7h 30m' },
  { question: 'How many days in a leap year?', options: ['364','365','366','367'], answer: '366' },
  { question: 'A meeting starts at 14:40 and lasts 1h 55m. What time does it end?', options: ['16:25','16:35','16:45','16:55'], answer: '16:35' },
  { question: 'Convert 3h 42m to minutes.', options: ['202','212','222','232'], answer: '222' },
];
const L4 = L3;
const L5 = L3;

export default makeGame({
  slug: 'time-teller',
  title: 'Time Teller',
  emoji: '🕐',
  subject: 'maths',
  ageGroups: ['5–7', '8–10', '11–13'],
  description: 'Read analogue and digital clocks, calculate time differences and solve time word problems!',
  accentClass: 'bg-primary',
  questionsByLevel: [L1, L2, L3, L4, L5],
});
