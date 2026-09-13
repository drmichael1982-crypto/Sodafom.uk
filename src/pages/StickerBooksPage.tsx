import { useEffect, useRef } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { useNavigate } from 'react-router';
import { mountStickerBook } from '@/components/sticker-books/editor';
import '@/components/sticker-books/sticker-books.css';

export default function StickerBooksPage() {
  const root = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;
  useEffect(() => {
    if (root.current) return mountStickerBook(root.current, () => navigateRef.current('/'));
  }, []);
  return <main>
    <Helmet><title>Archie's Sticker Books — Sodafom</title></Helmet>
    <div ref={root} />
  </main>;
}
