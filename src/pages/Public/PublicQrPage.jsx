import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import Button from '../../components/ui/Button';
import { publicApi } from '../../api/publicApi';
import { QRCodeCanvas } from 'qrcode.react';

const PublicQrPage = () => {
  const { docId } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ['public-qr', docId],
    queryFn: () => publicApi.fetchQr(docId),
    enabled: Boolean(docId),
  });

  const handleDownload = () => {
    const canvas = document.querySelector('#papdocauthx-public-qr canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `${docId}-qr.png`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm uppercase tracking-[0.4em] text-blue-400">QR Identity</p>
          <h1 className="mt-3 text-4xl font-semibold">Document QR for {docId}</h1>
          <p className="mt-2 text-slate-300/80">Share this QR with verifiers to pull trusted metadata instantly.</p>
          <Card className="mt-10 p-10 text-center space-y-4">
            {isLoading && <Loader label="Fetching" />}
            {!isLoading && error && <p className="text-sm text-rose-300">Unable to fetch QR payload. Please retry.</p>}
            {!isLoading && data && !error && (
              <div className="space-y-6">
                <div id="papdocauthx-public-qr" className="mx-auto rounded-3xl border border-white/10 bg-white/5 p-4">
                  <QRCodeCanvas value={data.qrValue || `papdocauthx://${docId}`} bgColor="transparent" fgColor="#00E0FF" size={240} />
                </div>
                <div className="text-sm text-slate-300 space-y-1">
                  <p className="font-semibold">{data.docName || 'Secure document'}</p>
                  <p className="text-xs text-slate-400">Document ID: {docId}</p>
                </div>
                <Button onClick={handleDownload}>Download QR</Button>
                <p className="text-xs text-slate-400">Expires in {data.expiresIn || '—'}</p>
              </div>
            )}
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default PublicQrPage;
