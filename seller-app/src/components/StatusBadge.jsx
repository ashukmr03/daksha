import React from "react";

const map = {
  pending:      { cls: "badge-yellow", label: "Pending" },
  accepted:     { cls: "badge-plum",   label: "Accepted" },
  payment_done: { cls: "badge-green",  label: "Paid" },
  delivered:    { cls: "badge-green",  label: "Delivered" },
  cancelled:    { cls: "badge-gray",   label: "Cancelled" }
};

export default function StatusBadge({ status }) {
  const { cls, label } = map[status] || { cls: "badge-gray", label: status };
  return <span className={`badge ${cls}`}>{label}</span>;
}
