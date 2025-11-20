import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { qrApi } from '../../api/qrApi';
import useUIStore from '../../store/uiStore';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';

const ScanQR = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const setBreadcrumbs = useUIStore((state) => state.setBreadcrumbs);
  const scannerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setBreadcrumbs(['PapDocAuthX', 'QR', 'Scan']);
  }, [setBreadcrumbs]);

  const mutation = useMutation({
    mutationFn: qrApi.resolve,
    onSuccess: (data) => {
      enqueueSnackbar('QR decoded. Redirecting…', { variant: 'success' });
      scannerRef.current?.clear().catch(() => {});
      setTimeout(() => navigate(`/documents/${data.documentId}`), 800);
    },
    onError: () => setError('Invalid QR payload'),
  });

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader-container',
      { fps: 10, qrbox: { width: 250, height: 250 }, showTorchButtonIfSupported: true },
      false
    );

    scanner.render(
      (qrText) => {
        mutation.mutate({ qrValue: qrText });
      },
      (scanError) => {
        if (scanError?.message) {
          console.debug('QR scan error', scanError.message);
        }
      }
    );

    scannerRef.current = scanner;

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [mutation]);

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
      <Card className="p-8">
        <h1 className="text-2xl font-semibold text-white">Scan document QR</h1>
        <p className="mt-2 text-sm text-slate-400">Align the QR code within the frame. We&apos;ll auto-navigate once resolved.</p>
        <div
          id="qr-reader-container"
          className="mt-6 w-full max-w-md rounded-3xl border-2 border-blue-500/60 bg-black/40 p-2 shadow-[0_20px_40px_rgba(59,130,246,0.35)]"
        />
      </Card>
      <Modal open={Boolean(error)} onClose={() => setError(null)}>
        <h3 className="text-lg font-semibold text-white">Invalid QR</h3>
        <p className="mt-2 text-sm text-slate-300">{error}</p>
        <div className="mt-4 flex justify-end">
          <Button variant="secondary" onClick={() => setError(null)}>
            Close
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
};

export default ScanQR;
