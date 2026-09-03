type TicketDescriptionProps = {
  description: string;
};

export default function TicketDescription({
  description,
}: TicketDescriptionProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Description</h2>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">
        {description}
      </p>
    </div>
  );
}