// Original starter stories written for the new reader; all controls use real text.
export const BOOKS = [
  { id: 'lost-key', title: 'Archie and the Lost Key', emoji: '🔑', pages: [
    'Archie found a tiny golden key beside the garden gate. “Who has lost this?” he wondered. He looked around for someone who might need help.',
    'Under the oak tree, a little rabbit was searching the grass. “My seed box is locked,” said Rabbit. Archie held up the key. “Shall we try it together?”',
    'Click! The box opened. Inside were sunflower seeds. Archie and Rabbit planted them in the sunny garden and watered the soil.',
    'Weeks later, tall sunflowers nodded in the breeze. Archie smiled. One small act of kindness had helped a whole garden grow.'
  ] },
  { id: 'seal-pup', title: 'Archie and the Seal Pup', emoji: '🌊', pages: [
    'On a walk beside the sea, Archie spotted a seal pup resting on the sand. “Look how quietly it is sleeping,” he whispered.',
    'Archie stayed far away and kept the dog on its lead. A beach ranger explained that seal pups need quiet space to rest.',
    'The ranger put up a sign to help other walkers give the pup room. Archie drew a picture of the sea while they watched from a safe distance.',
    'Soon the seal opened its eyes and wriggled towards the waves. Archie waved from the path. Helping wildlife can mean giving it space.'
  ] },
  { id: 'moon-garden', title: 'The Moonlight Garden', emoji: '🌻', pages: [
    'One evening, Archie noticed a white flower opening in the garden. During the day it had looked like a folded umbrella.',
    'A moth fluttered down to the flower. Archie watched quietly. The pale petals were easy to see in the moonlight.',
    '“Some flowers welcome visitors at night,” said his teacher. Archie wrote the time and drew the moth in his notebook.',
    'The next evening he looked again. A good explorer watches carefully, asks questions and comes back to learn more.'
  ] },
  { id: 'number-bridge', title: 'The Number Bridge', emoji: '🌉', pages: [
    'Archie reached a stream with stepping stones. The stones were marked 2, 4, 6 and 8. What number would come next?',
    '“The numbers go up in twos,” Archie said. He found a stone marked 10. Beyond it was another stone marked 12.',
    'Archie counted his steps: two, four, six, eight, ten, twelve. He checked that each stone was steady before crossing.',
    'On the other side, Archie made a number pattern of his own: 5, 10, 15, 20. Can you say the next number?'
  ] }
] as const;
export const SPELLING_WORDS: Record<number, string[]> = {
  1: ['Monday','Tuesday','Sunday','school','friend','little','today'],
  2: ['because','people','children','beautiful','every','again','great'],
  3: ['Wednesday','answer','build','early','learn','heard','often'],
  4: ['Wednesday','beautiful','because','different','important','remember','question'],
  5: ['achieve','available','curiosity','excellent','familiar','immediate','language'],
  6: ['necessary','opportunity','pronunciation','recommend','sufficient','temperature','vegetable'],
  7: ['accommodate','accompany','achieve','aggressive','amateur','ancient','apparent'],
  8: ['appreciate','attached','available','average','awkward','bargain','bruise'],
  9: ['cemetery','committee','conscience','conscious','controversy','convenience','correspond'],
};
