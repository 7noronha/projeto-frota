import { redirect } from 'next/navigation';

export default function PaginaRaiz(): never {
  redirect('/dashboard');
}
