import { redirect } from 'next/navigation'

// /search is merged into /browse which has a built-in search bar
export default function SearchPage() {
  redirect('/browse')
}
