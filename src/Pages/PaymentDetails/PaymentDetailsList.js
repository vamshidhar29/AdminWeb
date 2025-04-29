import React, { useState } from "react";
import { fetchAllData } from "../../helpers/externapi";
import {
    Container, Box, TextField, Button, CircularProgress,
    Typography, Card, CardContent, CardHeader, Alert, Grid
} from '@mui/material';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function PaymentDetailsList(props) {
    const [inputValue, setInputValue] = useState("");
    const [showCard, setShowCard] = useState(false);
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleSubmit = async () => {
        setShowCard(true);
        setLoading(true);
        setError(false);

        try {
            const response = await fetchAllData(`lambdaAPI/Payment/GetPaymentDetailsByUTRNumber/${inputValue}`);
            if (response && response.length > 0) {
                setPaymentDetails(response[0]);
            } else {
                console.warn("No payment details found for UTR:", inputValue);
                setPaymentDetails(null);
                setError(true);
            }
        } catch (error) {
            console.error("Error fetching payment details:", error);
            setPaymentDetails(null);
            setError(true);
        }

        setLoading(false);
    };

    const handleDownload = () => {
        const input = document.getElementById("downloadable-content");
        html2canvas(input).then((canvas) => {  // Removed scale option
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "landscape",
                unit: "px",
                format: [canvas.width, canvas.height]
            });
            pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
            pdf.save(`${paymentDetails.Name}.pdf`);
        });
    };

    const handlePrint = () => {
        const content = document.getElementById("downloadable-content").innerHTML;
        const printWindow = window.open("", "", "width=800,height=600");
        printWindow.document.write('<html><head><title>Print Payment Details</title>');
        printWindow.document.write('</head><body >');
        printWindow.document.write(content);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <Card
            sx={{
                width: '100%',
                mb: 4,
                borderRadius: '16px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,51,102,0.02)',
                overflow: 'hidden',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                '&:hover': {
                    boxShadow: '0 15px 35px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,51,102,0.05)',
                    transform: 'translateY(-5px)'
                },
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '5px',
                    background: 'linear-gradient(90deg, #003366 0%, #0066cc 100%)',
                    zIndex: 1
                }
            }}
        >
            <CardHeader
                title="Payment Details"
                sx={{
                    background: 'linear-gradient(135deg, #003366 0%, #004080 100%)',
                    color: 'white',
                    textAlign: 'center',
                    py: 3,
                    position: 'relative',
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: '10%',
                        width: '80%',
                        height: '1px',
                        background: 'rgba(255,255,255,0.2)'
                    },
                    '& .MuiCardHeader-title': {
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        letterSpacing: '0.5px',
                        textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }
                }}
            />
            <CardContent
                sx={{
                    p: { xs: 3, md: 4 },
                    background: 'linear-gradient(135deg, #f8fafd 0%, #f2f6fc 100%)',
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(0,51,102,0.02) 0%, transparent 20%)',
                        backgroundRepeat: 'no-repeat'
                    }
                }}
            >
                {/* Search Form */}
                <Box component="form" sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, width: '100%', position: 'relative', zIndex: 2 }}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Enter UTR Number"
                        value={inputValue}
                        onChange={handleInputChange}
                        inputProps={{ maxLength: 15, sx: { py: 1.7, px: 2, fontSize: '1rem' } }}
                        sx={{
                            flexGrow: 1,
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,51,102,0.05)',
                                overflow: 'hidden',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,51,102,0.1)'
                                },
                                '&.Mui-focused': {
                                    boxShadow: '0 4px 18px rgba(0,51,102,0.12), 0 0 0 2px rgba(0,51,102,0.2)'
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline, &.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'transparent'
                                }
                            }
                        }}
                        InputProps={{
                            startAdornment: (
                                <Box sx={{ color: 'rgba(0,51,102,0.6)', mr: 1, display: 'flex' }}>
                                </Box>
                            )
                        }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        sx={{
                            height: { xs: '56px', sm: '58px' },
                            minWidth: { xs: '100%', sm: '160px' },
                            fontSize: '1rem',
                            fontWeight: 600,
                            borderRadius: '12px',
                            textTransform: 'none',
                            background: 'linear-gradient(135deg, #003366 0%, #0066cc 100%)',
                            boxShadow: '0 5px 15px rgba(0,51,102,0.3)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 20px rgba(0,51,102,0.4)',
                                background: 'linear-gradient(135deg, #00264d 0%, #0059b3 100%)'
                            }
                        }}
                    >
                        Search
                    </Button>
                </Box>
                {loading && <CircularProgress sx={{ mt: 4, display: 'block', mx: 'auto' }} />}
                {error && (
                    <Alert severity="error" sx={{ mt: 4 }}>
                        No payment details found for the provided UTR number. Please try again.
                    </Alert>
                )}
                {!loading && paymentDetails && (
                    <Box mt={5} sx={{ zIndex: 2, position: 'relative' }}>
                        <Box id="downloadable-content" sx={{ borderRadius: '14px', overflow: 'hidden', boxShadow: '0 8px 28px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,51,102,0.05)' }}>
                            {/* Payment Details Content */}
                            <div className="card invoice-preview-card" style={{ border: 'none', overflow: 'hidden' }}>
                                <div className="card-body" style={{ background: 'linear-gradient(135deg, #ffffff, #e6f0ff)', padding: '2rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '300px', background: 'radial-gradient(circle at top right, rgba(0,51,102,0.04), transparent 70%)', zIndex: 0 }}></div>
                                    <div className="d-flex justify-content-between flex-xl-row flex-md-column flex-sm-row flex-column p-sm-3 p-0" style={{ position: 'relative', zIndex: 1 }}>
                                        <div className="mb-xl-0 mb-2">
                                            <div className="d-flex align-items-center gap-3 mb-4">
                                                <div style={{ position: 'relative', width: '65px', height: '65px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'white', boxShadow: '0 4px 16px rgba(0,51,102,0.1)' }}>
                                                    <img src="/assets/applogo.png" height="48" alt="App Logo" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))', position: 'relative', zIndex: 1 }} />
                                                </div>
                                                <span style={{ color: '#003366', fontSize: '1.7rem', fontWeight: 800, letterSpacing: '0.5px', textShadow: '0 2px 4px rgba(0,51,102,0.08)' }}>OHOINDIA</span>
                                            </div>
                                            {['5th floor,1-98/9/4/20, Arunodaya colony,', 'VIP Hills, Silicon Valley, Madhapur,', 'HITEC City, Hyderabad, Telangana 500081.'].map((line, i) => (
                                                <p key={i} className="mb-1" style={{ color: '#444', fontSize: '0.97rem', lineHeight: '1.7' }}>{line}</p>
                                            ))}
                                            <p className="mb-0" style={{ color: '#003366', fontSize: '0.97rem', lineHeight: '1.7', fontWeight: 600, marginTop: '10px' }}>+91 70321 07108</p>
                                        </div>
                                        <div style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', padding: '16px 24px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,51,102,0.07)', alignSelf: 'flex-start' }}>
                                            <div style={{ color: '#003366', fontWeight: 600, fontSize: '1.05rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                <span style={{ fontSize: '0.85rem', color: 'rgba(0,51,102,0.6)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>Payment Date</span>
                                                <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                                                    {new Date(paymentDetails.PaidDate).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ height: '3px', background: 'linear-gradient(90deg, #003366 0%, #0066cc 100%)' }}></div>
                                <div className="card-body" style={{ backgroundColor: '#f9f9f9', padding: '5px' }}>
                                    <div className="row p-sm-3 p-0">
                                        <div className="col-xl-6 col-md-12 col-sm-5 col-12 mb-xl-0 mb-md-4">
                                            <h6 style={{ color: '#003366', fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', position: 'relative', paddingBottom: '8px' }}>
                                                <span style={{ position: 'absolute', bottom: 0, left: 0, width: '40px', height: '3px', background: 'linear-gradient(90deg, #003366 0%, #0066cc 100%)', borderRadius: '2px' }}></span>
                                                Payment Details
                                            </h6>
                                            <div style={{ display: 'grid', rowGap: '12px', marginTop: '24px' }}>
                                                {[
                                                    { label: 'Full Name:', value: paymentDetails.Name },
                                                    { label: 'Mobile Number:', value: paymentDetails.MobileNumber },
                                                    { label: 'Gender:', value: paymentDetails.Gender },
                                                    { label: 'Age:', value: paymentDetails.Age }
                                                ].map((item, i) => (
                                                    <p key={i} style={{ margin: 0, color: '#444', fontSize: '0.97rem', display: 'flex' }}>
                                                        <span style={{ fontWeight: 600, width: '140px', display: 'inline-block', color: 'rgba(0,51,102,0.7)' }}>{item.label}</span>
                                                        <span style={{ fontWeight: 500 }}>{item.value}</span>
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="col-xl-6 col-md-12 col-sm-7 col-12">
                                            <h6 style={{ color: '#003366', fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', position: 'relative', paddingBottom: '8px' }}>
                                                <span style={{ position: 'absolute', bottom: 0, left: 0, width: '40px', height: '3px', background: 'linear-gradient(90deg, #003366 0%, #0066cc 100%)', borderRadius: '2px' }}></span>
                                                Bill To
                                            </h6>
                                            <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.04)', marginTop: '24px' }}>
                                                {[
                                                    { label: 'Total Amount:', value: `₹${parseInt(paymentDetails.PaidAmount).toLocaleString('en-IN')}`, isAmount: true },
                                                    { label: 'Country:', value: 'India' },
                                                    { label: 'UTR Number:', value: paymentDetails.UTRNumber, isUTR: true }
                                                ].map((item, i, arr) => (
                                                    <div key={i} style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        padding: '10px 0',
                                                        borderBottom: i < arr.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none'
                                                    }}>
                                                        <div style={{ fontWeight: 600, color: 'rgba(0,51,102,0.7)', fontSize: '0.97rem' }}>{item.label}</div>
                                                        <div style={
                                                            item.isAmount
                                                                ? { fontWeight: 700, color: '#003366', fontSize: '1.2rem' }
                                                                : item.isUTR
                                                                    ? { fontSize: '0.97rem', fontFamily: 'monospace', fontWeight: 600, letterSpacing: '0.5px' }
                                                                    : { fontSize: '0.97rem' }
                                                        }>{item.value}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="table-responsive">
                                    <table className="table m-0" style={{ marginBottom: 0 }}>
                                        <thead>
                                            <tr style={{ background: 'linear-gradient(135deg, #003366 0%, #004080 100%)' }}>
                                                {['Product', 'Type of Card', 'Transaction Type', 'Cash Taken By', 'Price'].map(header => (
                                                    <th
                                                        key={header}
                                                        style={{
                                                            padding: '10px 12px',
                                                            fontWeight: 700,
                                                            fontSize: '1rem',
                                                            letterSpacing: '1px',
                                                            textTransform: 'uppercase',
                                                            color: '#ffffff',
                                                            borderBottom: 'none'
                                                        }}
                                                    >
                                                        {header}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>

                                        <tbody style={{ backgroundColor: 'white' }}>
                                            <tr>
                                                <td style={{ padding: '18px 20px', fontSize: '0.97rem', fontWeight: 500 }}>{paymentDetails.ProductName}</td>
                                                <td style={{ padding: '18px 20px', fontSize: '0.97rem' }}>{paymentDetails.TypeofCard}</td>
                                                <td style={{ padding: '18px 20px', fontSize: '0.97rem' }}>{paymentDetails.TypeofTransaction}</td>
                                                <td style={{ padding: '18px 20px', fontSize: '0.97rem' }}>{paymentDetails.CashTakenBy}</td>
                                                <td style={{ padding: '18px 20px', fontSize: '0.97rem', fontWeight: 700, color: '#003366' }}>
                                                    ₹{parseInt(paymentDetails.PaidAmount).toLocaleString('en-IN')}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="card-body" style={{ backgroundColor: '#f9f9f9', padding: '1rem 1.5rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                                    <div className="row">
                                        <div className="col-12" style={{ background: 'rgba(255,255,255,0.7)', padding: '16px 20px', borderRadius: '8px', borderLeft: '4px solid #003366' }}>
                                            <span style={{ fontWeight: 700, color: '#003366', fontSize: '0.97rem' }}>Note:</span>
                                            <span style={{ color: '#555', fontSize: '0.97rem', fontStyle: 'italic' }}> It was a pleasure working with you and your team. We hope you will keep us in mind for future freelance projects. Thank You!</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Box>
                        {/* Action Buttons */}
                        <Box
                            className="card-body"
                            sx={{
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                justifyContent: 'center',
                                gap: 3,
                                pt: 2,
                                pb: 0,
                                px: 2
                            }}
                        >

                            {[
                                {
                                    label: 'Download',
                                    onClick: handleDownload,
                                    bgGradient: 'linear-gradient(135deg, #17A589 0%, #0d8a72 100%)',
                                    hoverBg: 'linear-gradient(135deg, #148f77 0%, #0a7761 100%)',

                                },
                                {
                                    label: 'Print',
                                    onClick: handlePrint,
                                    bgGradient: 'linear-gradient(135deg, #E67E22 0%, #d35400 100%)',
                                    hoverBg: 'linear-gradient(135deg, #d35400 0%, #c44e00 100%)'
                                }
                            ].map((btn, i) => (
                                <Button
                                    key={i}
                                    onClick={btn.onClick}
                                    startIcon={
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)', marginRight: '4px' }}>
                                            <span role="img" aria-label={btn.label.toLowerCase()}>{btn.emoji}</span>
                                        </div>
                                    }
                                    sx={{
                                        background: btn.bgGradient,
                                        color: 'white',
                                        fontWeight: 600,
                                        borderRadius: '10px',
                                        px: 3.5,
                                        py: 1.4,
                                        minWidth: { xs: '100%', sm: '170px' },
                                        boxShadow: `0 4px 15px ${btn.shadowColor}`,
                                        '&:hover': {
                                            background: btn.hoverBg,
                                            transform: 'translateY(-2px)',
                                            boxShadow: `0 8px 20px ${btn.shadowColor}`
                                        },
                                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                    }}
                                >
                                    {btn.label}
                                </Button>
                            ))}
                        </Box>
                    </Box>
                   
                )}
        </CardContent>
        </Card >
    );
}
