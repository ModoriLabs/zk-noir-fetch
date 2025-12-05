"use client";

import { useState } from "react";

export default function Home() {
  const [formData, setFormData] = useState({
    date: "",
    documentId: "",
    zkEngine: "snarkjs" as "snarkjs" | "barretenberg",
  });

  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: formData.date,
          documentId: formData.documentId,
          zkEngine: formData.zkEngine,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "A server error has occurred.");
      }

      if (data.success) {
        setResult(data.proof);
      } else {
        throw new Error(data.error || "Proof creation failed.");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            TossBank Document Verification
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date (YYYY-MM-DD)
                </label>
                <input
                  type="text"
                  value={formData.date}
                  onChange={(e) => {
                    let value = e.target.value.replace(/[^\d]/g, "");

                    if (value.length >= 5) {
                      value = value.slice(0, 4) + "-" + value.slice(4);
                    }
                    if (value.length >= 8) {
                      value = value.slice(0, 7) + "-" + value.slice(7);
                    }
                    if (value.length > 10) {
                      value = value.slice(0, 10);
                    }

                    setFormData({ ...formData, date: value });
                  }}
                  className="w-full px-3 py-2 border-2 border-gray-400 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="YYYY-MM-DD"
                  maxLength={10}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document ID
                </label>
                <input
                  type="text"
                  value={formData.documentId}
                  onChange={(e) => {
                    let value = e.target.value
                      .replace(/[^A-Z0-9]/gi, "")
                      .toUpperCase();

                    if (value.length >= 5) {
                      value = value.slice(0, 4) + "-" + value.slice(4);
                    }
                    if (value.length >= 10) {
                      value = value.slice(0, 9) + "-" + value.slice(9);
                    }

                    if (value.length > 18) {
                      value = value.slice(0, 18);
                    }

                    setFormData({ ...formData, documentId: value });
                  }}
                  className="w-full px-3 py-2 border-2 border-gray-400 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0000-XXXX-XXXXXX"
                  maxLength={18}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZK Engine
                </label>
                <select
                  value={formData.zkEngine}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      zkEngine: e.target.value as "snarkjs" | "barretenberg",
                    })
                  }
                  className="w-full px-3 py-2 border-2 border-gray-400 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="snarkjs">SnarkJS</option>
                  <option value="barretenberg">Barretenberg</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 px-4 rounded-md transition-colors"
            >
              {loading ? "Generating proof..." : "Verify Document"}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <h3 className="text-lg font-medium text-green-800 mb-4">
                Proof Completed!
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700">
                    Extracted Value:
                  </h4>
                  <p className="text-gray-600">
                    Title: {result.extractedParameterValues?.title}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700">Context:</h4>
                  <pre className="text-sm text-gray-600 bg-gray-100 p-2 rounded overflow-x-auto">
                    {JSON.stringify(
                      JSON.parse(result.claimData?.context || "{}"),
                      null,
                      2
                    )}
                  </pre>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700">Proof Data:</h4>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                      View Full Proof Data
                    </summary>
                    <pre className="text-xs text-gray-600 bg-gray-100 p-2 rounded mt-2 overflow-x-auto max-h-96 overflow-y-auto">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
