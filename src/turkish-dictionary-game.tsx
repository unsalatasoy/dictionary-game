import { useState, useEffect, useRef } from 'react';

// Tip tanımlamaları
type WordList = {
  [key: string]: string[];
};

type Question = {
  words: string[];
  answer: string[];
  type: 'İkili Grup' | 'Üçlü Grup' | 'Dörtlü Grup';
};

type TouchRef = {
  word: string;
  index: number;
} | null;

export default function TurkishDictionaryGame() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [words, setWords] = useState<string[]>([]);
  const [draggedWord, setDraggedWord] = useState<string | null>(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [correct, setCorrect] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [touchedIndex, setTouchedIndex] = useState<number | null>(null);
  
  // Ekran genişliğini takip etmek için
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  // Touch kontrolü için referanslar
  const touchStartRef = useRef<TouchRef>(null);
  const touchTargetRef = useRef<HTMLDivElement | null>(null);

  // Tüm kelime grupları
  const wordLists: WordList = {
    a: ['armut', 'asker', 'anne', 'araba', 'ayva', 'altın', 'ateş', 'ayna', 'aslan', 'akıl'],
    b: ['balık', 'bebek', 'böcek', 'balon', 'burun', 'bahçe', 'benek', 'boya', 'bayrak', 'batı'],
    c: ['ceviz', 'cam', 'ceket', 'cuma', 'ceylan', 'camcı', 'coşku', 'cıvık', 'cimri', 'cüzdan'],
    ç: ['çiçek', 'çanta', 'çocuk', 'çorap', 'çelik', 'çamur', 'çatı', 'çerez', 'çimen', 'çakal'],
    d: ['deniz', 'dolap', 'doktor', 'defter', 'duman', 'diken', 'davul', 'dünya', 'duvar', 'dede'],
    e: ['elma', 'ekmek', 'erik', 'ev', 'el', 'eşek', 'eldiven', 'erik', 'elbise', 'engel'],
    f: ['fındık', 'fare', 'fidan', 'film', 'fırın', 'fırtına', 'fırça', 'fare', 'fabrika', 'fikir'],
    g: ['gemi', 'güneş', 'göz', 'gece', 'gül', 'gölge', 'gurup', 'gazete', 'galip', 'gitar'],
    h: ['havuç', 'horoz', 'hasta', 'hava', 'hırka', 'haber', 'harita', 'hurma', 'halı', 'hediye'],
    ı: ['ışık', 'ırmak', 'ılık', 'ıspanak', 'ıslak', 'ısı', 'ıhlamur', 'ısırgan', 'ıslık', 'ızgara'],
    i: ['inek', 'ip', 'iğne', 'incir', 'itfaiye', 'irmik', 'iskelet', 'ipek', 'izci', 'inci'],
    j: ['jeton', 'jilet', 'jambon', 'jelatin', 'jüri', 'jet', 'jeoloji', 'judo', 'jöle', 'jandarma'],
    k: ['kalem', 'köpek', 'kuş', 'kitap', 'kedi', 'kurbağa', 'kiraz', 'kulak', 'kürek', 'karpuz'],
    l: ['limon', 'lamba', 'lokum', 'lahana', 'lale', 'leke', 'leylak', 'loş', 'lezzet', 'lodos'],
    m: ['masa', 'mavi', 'meyve', 'mum', 'mantar', 'merdiven', 'maymun', 'mandal', 'mektep', 'müzik'],
    n: ['nar', 'nehir', 'nohut', 'ney', 'nine', 'nane', 'nota', 'nefes', 'nutuk', 'nokta'],
    o: ['orman', 'okul', 'oyun', 'oda', 'odun', 'otobüs', 'okyanus', 'ot', 'oyuncak', 'oğul'],
    ö: ['öğretmen', 'ördek', 'örnek', 'öküz', 'ölçü', 'örgü', 'ödev', 'örtü', 'özgür', 'özlem'],
    p: ['para', 'pencere', 'perde', 'portakal', 'pil', 'pasta', 'patates', 'pancar', 'pazar', 'pınar'],
    r: ['resim', 'robot', 'radyo', 'rakam', 'renk', 'rüzgar', 'roman', 'raket', 'reçel', 'rüya'],
    s: ['su', 'süt', 'saat', 'sabun', 'salı', 'soba', 'sepet', 'sınıf', 'silgi', 'sandalye'],
    ş: ['şeker', 'şapka', 'şerit', 'şeftali', 'şaşkın', 'şişe', 'şarkı', 'şehir', 'şimşek', 'şamdan'],
    t: ['tahta', 'top', 'tren', 'taş', 'tüy', 'terlik', 'tencere', 'tarak', 'tuz', 'turşu'],
    u: ['uçak', 'uyku', 'un', 'uzay', 'uzun', 'usta', 'ütü', 'uğur', 'ufuk', 'unutkan'],
    ü: ['üzüm', 'ülke', 'ütü', 'üst', 'ünlü', 'ünlem', 'üçgen', 'ürün', 'üretim', 'üniforma'],
    v: ['vazo', 'valiz', 'vişne', 'vatan', 'vakit', 'vadi', 'vida', 'vücut', 've', 'vulkan'],
    y: ['yaprak', 'yüzük', 'yıldız', 'yastık', 'yuva', 'yoğurt', 'yumurta', 'yağmur', 'yarasa', 'yazı'],
    z: ['zeytin', 'zil', 'zarf', 'zambak', 'zincir', 'zemin', 'zeka', 'zurna', 'zengin', 'zaman']
  };

  // Mobil cihaz kontrolü
  useEffect(() => {
    const checkIfMobile = (): void => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Verilen kelime listesinden rastgele kelimeler seçen yardımcı fonksiyon
  const getRandomWords = (list: string[], count: number): string[] => {
    const shuffled = [...list].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // Rastgele bir harf seçen yardımcı fonksiyon
  const getRandomLetter = (): string => {
    const letters = Object.keys(wordLists);
    return letters[Math.floor(Math.random() * letters.length)];
  };

  // Rastgele kelimelerden soru oluşturan fonksiyon
  const generateQuestion = (type: 'İkili Grup' | 'Üçlü Grup' | 'Dörtlü Grup'): Question => {
    const letter = getRandomLetter();
    const count = type === 'İkili Grup' ? 2 : type === 'Üçlü Grup' ? 3 : 4;
    
    // Rastgele kelimeler seç
    const selectedWords = getRandomWords(wordLists[letter], count);
    
    // Alfabetik sıralama (doğru cevap)
    const answer = [...selectedWords].sort((a, b) => a.localeCompare(b, 'tr'));
    
    return {
      words: selectedWords,
      answer: answer,
      type: type
    };
  };

  // Oyun başlangıcında veya yeniden başlatıldığında soruları oluştur
  const generateQuestions = (): Question[] => {
    const newQuestions: Question[] = [
      // 3 tane ikili grup
      generateQuestion('İkili Grup'),
      generateQuestion('İkili Grup'),
      generateQuestion('İkili Grup'),
      // 3 tane üçlü grup
      generateQuestion('Üçlü Grup'),
      generateQuestion('Üçlü Grup'),
      generateQuestion('Üçlü Grup'),
      // 4 tane dörtlü grup
      generateQuestion('Dörtlü Grup'),
      generateQuestion('Dörtlü Grup'),
      generateQuestion('Dörtlü Grup'),
      generateQuestion('Dörtlü Grup'),
    ];
    
    setQuestions(newQuestions);
    return newQuestions;
  };

  // Oyun başlangıcında soruları oluştur
  useEffect(() => {
    const newQuestions = generateQuestions();
    const firstQuestion = newQuestions[0];
    const shuffledWords = [...firstQuestion.words].sort(() => Math.random() - 0.5);
    
    setWords(shuffledWords);
    setIsLoading(false);
  }, []);

  // Soru değiştiğinde kelimeleri güncelle
  useEffect(() => {
    if (questions.length > 0 && !isLoading) {
      const currentQuestion = questions[currentQuestionIndex];
      if (currentQuestion) {
        const shuffled = [...currentQuestion.words].sort(() => Math.random() - 0.5);
        setWords(shuffled);
        setShowAnswer(false);
        setCorrect(false);
      }
    }
  }, [currentQuestionIndex, questions, isLoading]);

  // Masaüstü sürükle bırak işlemleri
  const handleDragStart = (word: string): void => {
    setDraggedWord(word);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number): void => {
    e.preventDefault();
    setDraggedOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number): void => {
    e.preventDefault();

    if (draggedWord === null) return;

    // Sürüklenen kelimeyi yeni konuma taşı
    const newWords = [...words];
    const draggedWordIndex = newWords.indexOf(draggedWord);
    
    newWords.splice(draggedWordIndex, 1);
    newWords.splice(index, 0, draggedWord);
    
    setWords(newWords);
    setDraggedWord(null);
    setDraggedOverIndex(null);
  };

  // Mobil touch işlemleri
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>, word: string, index: number): void => {
    touchStartRef.current = {
      word: word,
      index: index
    };
    touchTargetRef.current = e.currentTarget;
    setTouchedIndex(index);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>, index: number): void => {
    if (touchStartRef.current && touchStartRef.current.index !== index) {
      // Kelimeyi yeni konuma taşı
      const newWords = [...words];
      const sourceIndex = touchStartRef.current.index;
      const sourceWord = touchStartRef.current.word;
      
      newWords.splice(sourceIndex, 1);
      newWords.splice(index, 0, sourceWord);
      
      setWords(newWords);
    }
    
    // Temizle
    touchStartRef.current = null;
    touchTargetRef.current = null;
    setTouchedIndex(null);
    setDraggedOverIndex(null);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>, index: number): void => {
    if (touchStartRef.current) {
      e.preventDefault(); // Sayfanın kaydırılmasını engelle
      setDraggedOverIndex(index);
    }
  };

  const swapWords = (word1Index: number, word2Index: number): void => {
    const newWords = [...words];
    const temp = newWords[word1Index];
    newWords[word1Index] = newWords[word2Index];
    newWords[word2Index] = temp;
    setWords(newWords);
  };

  const checkAnswer = (): void => {
    if (questions.length === 0 || isLoading) return;
    
    const currentAnswer = questions[currentQuestionIndex].answer;
    const isCorrect = words.every((word, index) => word === currentAnswer[index]);
    
    setCorrect(isCorrect);
    setShowAnswer(true);
    
    if (isCorrect) {
      setScore(score + 1);
    }
  };

  const nextQuestion = (): void => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setCompleted(true);
    }
  };

  const restartGame = (): void => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setCompleted(false);
    // Yeni sorular oluştur
    generateQuestions();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <p className="text-xl">Oyun yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg">
          <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">Oyun Tamamlandı!</h1>
          <p className="text-xl text-center mb-6">
            Toplam puanınız: <span className="font-bold text-green-600">{score}</span> / {questions.length}
          </p>
          <button
            onClick={restartGame}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Tekrar Oyna
          </button>
        </div>
      </div>
    );
  }

  // Güvenlik kontrolü
  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <p className="text-xl">Sorular hazırlanıyor...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
        <h1 className="text-2xl font-bold text-blue-700 mb-4 text-center">Türkçe Sözlük Sıralama Oyunu</h1>
        
        <div className="mb-4 flex justify-between items-center">
          <span className="font-semibold text-gray-700">Soru {currentQuestionIndex + 1}/{questions.length}</span>
          <span className="font-semibold text-gray-700">Puan: {score}</span>
        </div>
        
        <div className="bg-blue-100 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-medium mb-2">
            Aşağıdaki kelimeleri sözlük sırasına göre sıralayınız: ({currentQuestion.type})
          </h2>
          <div className="flex flex-wrap gap-2 mt-4">
            {words.map((word, index) => (
              <div
                key={word + index}
                draggable={!isMobile}
                onDragStart={() => handleDragStart(word)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onTouchStart={(e) => isMobile && handleTouchStart(e, word, index)}
                onTouchEnd={(e) => isMobile && handleTouchEnd(e, index)}
                onTouchMove={(e) => isMobile && handleTouchMove(e, index)}
                className={`py-2 px-4 bg-white rounded-lg shadow cursor-move border-2 ${
                  draggedOverIndex === index ? 'border-blue-500' : 
                  touchedIndex === index ? 'border-blue-500 bg-blue-50' : 'border-transparent'
                } ${
                  showAnswer && currentQuestion.answer[index] === word ? 'bg-green-100' : 
                  showAnswer && currentQuestion.answer[index] !== word ? 'bg-red-100' : 'bg-white'
                }`}
              >
                {word}
              </div>
            ))}
          </div>
        </div>

        {isMobile && !showAnswer && (
          <div className="mb-4">
            <p className="text-center text-sm text-gray-600 mb-2">Sıralamak istediğiniz iki kelimeye arka arkaya dokunun:</p>
            <div className="flex gap-2 justify-center">
              {touchedIndex !== null && (
                <p className="text-sm font-medium">
                  Seçildi: <span className="text-blue-700">{words[touchedIndex]}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {showAnswer && (
          <div className={`p-4 mb-4 rounded-lg ${correct ? 'bg-green-100' : 'bg-red-100'}`}>
            <p className="font-medium">
              {correct ? '👏 Doğru cevap!' : '❌ Yanlış cevap. Doğru sıralama:'}
            </p>
            {!correct && (
              <p className="mt-2 font-bold">{currentQuestion.answer.join(', ')}</p>
            )}
          </div>
        )}

        <div className="flex gap-3">
          {!showAnswer ? (
            <button
              onClick={checkAnswer}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Kontrol Et
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              {currentQuestionIndex < questions.length - 1 ? 'Sonraki Soru' : 'Sonuçları Gör'}
            </button>
          )}
        </div>
        
        <div className="mt-6 text-sm text-gray-600">
          <p>
            {isMobile 
              ? 'İpucu: Kelimelere dokunarak sıralayabilirsiniz.' 
              : 'İpucu: Kelimeleri sürükleyip bırakarak sıralayabilirsiniz.'}
          </p>
        </div>
      </div>
    </div>
  );
}