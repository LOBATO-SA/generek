import { useState, useEffect } from 'react'
import { X, CheckCircle } from 'lucide-react'
import './PaymentModal.css'

interface PaymentModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    totalPrice: number
}

type PaymentStep = 'selection' | 'processing' | 'success'

function PaymentModal({ isOpen, onClose, onSuccess, totalPrice }: PaymentModalProps) {
    const [step, setStep] = useState<PaymentStep>('selection')
    const [progress, setProgress] = useState(0)
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen) {
            setStep('selection')
            setProgress(0)
            setSelectedMethod(null)
        }
    }, [isOpen])

    // Simulation of processing
    useEffect(() => {
        if (step === 'processing') {
            const duration = Math.floor(Math.random() * (15000 - 10000 + 1)) + 10000 // 10-15s
            const interval = 100
            const increment = (interval / duration) * 100

            const timer = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(timer)
                        return 100
                    }
                    return prev + increment
                })
            }, interval)

            const timeout = setTimeout(() => {
                setStep('success')
                // Finalizar após ver o sucesso
                setTimeout(() => {
                    onSuccess()
                    onClose()
                }, 2000)
            }, duration)

            return () => {
                clearInterval(timer)
                clearTimeout(timeout)
            }
        }
    }, [step, onSuccess, onClose])

    if (!isOpen) return null

    const handleSelectMethod = (method: string) => {
        setSelectedMethod(method)
        setStep('processing')
    }

    return (
        <div className="payment-modal-overlay" onClick={onClose}>
            <div className="payment-modal-content" onClick={e => e.stopPropagation()}>
                <div className="payment-modal-header">
                    <h2>Pagamento</h2>
                    <button className="payment-close-btn" onClick={onClose} disabled={step === 'processing'}>
                        <X size={24} />
                    </button>
                </div>

                <div className="payment-modal-body">
                    {step === 'selection' && (
                        <>
                            <div className="payment-intro">
                                <p>Valor a pagar: <strong>KZ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></p>
                                <p style={{ marginTop: '8px', fontSize: '14px' }}>Escolha o seu método de pagamento preferido:</p>
                            </div>

                            <div className="payment-options">
                                <div className="payment-option-card" onClick={() => handleSelectMethod('express')}>
                                    <img src="/images/express.png" alt="Transferencia Express" />
                                    <span>Transferencia Express</span>
                                </div>
                                <div className="payment-option-card" onClick={() => handleSelectMethod('referencia')}>
                                    <img src="/images/referencia.png" alt="Pagamento por Referência" />
                                    <span>Pagamento por Referência</span>
                                </div>
                            </div>
                        </>
                    )}

                    {step === 'processing' && (
                        <div className="payment-processing">
                            <div className="processing-spinner"></div>
                            <div>
                                <h3>Processando Pagamento</h3>
                                <p>Por favor, aguarde enquanto confirmamos a sua transação via <strong>{selectedMethod === 'express' ? 'Transferencia Express' : 'Referência'}</strong>...</p>
                            </div>
                            <div className="progress-container">
                                <div
                                    className="progress-bar"
                                    style={{ width: `${progress}%`, transitionDuration: '100ms' }}
                                ></div>
                            </div>
                            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
                                Esta operação pode levar alguns segundos
                            </span>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="payment-success">
                            <div className="success-icon">
                                <CheckCircle size={48} />
                            </div>
                            <div>
                                <h3>Pagamento Confirmado!</h3>
                                <p>Sua contratação foi paga com sucesso e agora aguarda confirmação final.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PaymentModal
