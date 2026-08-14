import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import { useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Loading from "../../components/student/Loading";

const VerifyCertificate = () => {
    const { certificateId } = useParams();
    const navigate = useNavigate();

    const { backendUrl } = useContext(AppContext);

    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const verifyCertificate = async () => {
        try {
            setLoading(true);
            setError("");

            const { data } = await axios.get(
                `${backendUrl}/api/user/verify-certificate/${certificateId}`
            );

            if (data.success) {
                setCertificate(data.certificate);
            } else {
                setError(data.message || "Certificate not found");
            }

        } catch (error) {
            console.error("Certificate verification error:", error);

            setError(
                error.response?.data?.message ||
                "Unable to verify certificate"
            );
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (certificateId) {
            verifyCertificate();
        }
    }, [certificateId]);

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10">

            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <div className="text-center mb-8">

                    <h1 className="text-3xl font-bold text-gray-800">
                        Certificate Verification
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Verify the authenticity of a BrainWave certificate
                    </p>

                </div>

                {/* Certificate Result */}
                {certificate ? (

                    <div className="bg-white rounded-xl shadow-lg border border-green-200 overflow-hidden">

                        {/* Valid Header */}
                        <div className="bg-green-600 text-white px-6 py-5 text-center">

                            <div className="text-4xl mb-2">
                                ✓
                            </div>

                            <h2 className="text-2xl font-bold">
                                Certificate Verified
                            </h2>

                            <p className="text-green-100 mt-1">
                                This certificate is authentic and valid.
                            </p>

                        </div>

                        {/* Certificate Information */}
                        <div className="p-6 sm:p-8">

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Student Name
                                    </p>

                                    <p className="font-semibold text-gray-800 mt-1">
                                        {certificate.studentName}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Course
                                    </p>

                                    <p className="font-semibold text-gray-800 mt-1">
                                        {certificate.courseTitle}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Certificate ID
                                    </p>

                                    <p className="font-semibold text-gray-800 mt-1 break-all">
                                        {certificate.certificateId}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Verification Code
                                    </p>

                                    <p className="font-semibold text-gray-800 mt-1">
                                        {certificate.verificationCode}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Issued Date
                                    </p>

                                    <p className="font-semibold text-gray-800 mt-1">
                                        {new Date(
                                            certificate.issuedAt
                                        ).toLocaleDateString("en-IN", {
                                            day: "2-digit",
                                            month: "long",
                                            year: "numeric"
                                        })}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Chief Executive Officer
                                    </p>

                                    <p className="font-semibold text-gray-800 mt-1">
                                        {certificate.ceoName ||
                                            "Navaneeth Siliveri"}
                                    </p>
                                </div>

                            </div>

                            {/* Verification message */}
                            <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">

                                <p className="text-sm text-green-800">
                                    This certificate has been successfully
                                    verified against the BrainWave certificate
                                    database.
                                </p>

                            </div>

                            {/* Back button */}
                            <div className="flex justify-center mt-8">

                                <button
                                    onClick={() => navigate("/")}
                                    className="px-6 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                                >
                                    Back to BrainWave
                                </button>

                            </div>

                        </div>

                    </div>

                ) : (

                    /* Invalid Certificate */
                    <div className="bg-white rounded-xl shadow-lg border border-red-200 overflow-hidden">

                        <div className="bg-red-600 text-white px-6 py-6 text-center">

                            <div className="text-4xl mb-2">
                                ✕
                            </div>

                            <h2 className="text-2xl font-bold">
                                Certificate Not Found
                            </h2>

                        </div>

                        <div className="p-8 text-center">

                            <p className="text-gray-600 mb-2">
                                We could not verify this certificate.
                            </p>

                            <p className="text-sm text-gray-500 mb-6 break-all">
                                Certificate ID: {certificateId}
                            </p>

                            <button
                                onClick={() => navigate("/")}
                                className="px-6 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                            >
                                Back to BrainWave
                            </button>

                        </div>

                    </div>

                )}

            </div>

        </div>
    );
};

export default VerifyCertificate;