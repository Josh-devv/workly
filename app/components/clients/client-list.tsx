"use client"

type Props = {
  name: string;
  email: string;
  company: string;
  created_at: string;
  id: string;
}

const ClientList = ({ client }: { client: Props }) => {
  return (
    <div>client-list</div>
  )
}

export default ClientList;