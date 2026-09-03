type TicketRequesterProps = {
  name: string;
  email: string;
};

export default function TicketRequester({
  name,
  email,
}: TicketRequesterProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Requester</h2>

      <div className="mt-4">
        <p className="font-medium text-slate-900">
          {name}
        </p>

        <p className="text-sm text-slate-500">
          {email}
        </p>
      </div>
    </div>
  );
}