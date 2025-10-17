export default function PaymentCancel() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-red-500">❌ Payment Cancelled</h1>
        <p className="text-gray-600">Your payment was not completed. You can try again or contact support.</p>
        <a href="/admin/bookings" className="mt-6 inline-block px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition">Back to Bookings</a>
      </div>
    </div>
  );
}
