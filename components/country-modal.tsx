'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';
import type { Country } from '@/lib/types';
import { mockOpportunities } from '@/lib/mock-data';

interface CountryModalProps {
  country: Country | null;
  open: boolean;
  onClose: () => void;
}

const TABS = ['Overview', 'Trade Intel', 'Risks', 'Opportunities'] as const;
type Tab = typeof TABS[number];

export function CountryModal({ country, open, onClose }: CountryModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('Overview');

  if (!country) return null;

  const linkedOpps = mockOpportunities.filter((o) => o.markets.includes(country.name));

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(16px)',
              zIndex: 50,
            }}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90vw',
              maxWidth: 720,
              maxHeight: '85vh',
              background: '#0a0a0a',
              border: '1px solid #1c1c1e',
              borderRadius: 16,
              zIndex: 51,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            role="dialog"
            aria-modal="true"
            aria-label={`${country.name} intelligence profile`}
          >
            {/* Modal Header */}
            <div
              className="flex items-center justify-between flex-shrink-0"
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #1c1c1e',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  style={{
                    width: 40,
                    height: 28,
                    background: '#1c1c1e',
                    borderRadius: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                  }}
                  aria-hidden="true"
                >
                  {country.flag}
                </div>
                <div>
                  <h2
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: 18,
                      color: '#ffffff',
                      lineHeight: 1.2,
                    }}
                  >
                    {country.name}
                  </h2>
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: 400,
                      fontSize: 11,
                      color: '#737373',
                    }}
                  >
                    {country.region}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close country profile"
                style={{
                  width: 32,
                  height: 32,
                  background: '#1c1c1e',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  color: '#737373',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s, color 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#2c2c2e';
                  (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#1c1c1e';
                  (e.currentTarget as HTMLButtonElement).style.color = '#737373';
                }}
              >
                <X size={15} aria-hidden="true" />
              </button>
            </div>

            {/* Tabs */}
            <div
              className="flex flex-shrink-0"
              style={{
                padding: '0 24px',
                borderBottom: '1px solid #1c1c1e',
              }}
              role="tablist"
            >
              {TABS.map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontWeight: isActive ? 600 : 400,
                      fontSize: 13,
                      color: isActive ? '#ffffff' : '#737373',
                      background: isActive ? '#1c1c1e' : 'transparent',
                      border: 'none',
                      borderBottom: isActive ? '2px solid #ffffff' : '2px solid transparent',
                      padding: '12px 16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      marginBottom: -1,
                    }}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div
              role="tabpanel"
              style={{ flex: 1, overflowY: 'auto', padding: '24px' }}
            >
              {activeTab === 'Overview' && (
                <div>
                  {/* Stats Grid */}
                  <div
                    className="grid gap-3 mb-6"
                    style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
                  >
                    {[
                      { label: 'GDP', value: country.gdp },
                      { label: 'Growth', value: country.gdp_growth, green: true },
                      { label: 'Population', value: country.population },
                      { label: 'Currency', value: country.currency },
                      { label: 'Leader', value: country.leader },
                      { label: 'Capital', value: country.capital },
                    ].map((item) => (
                      <div
                        key={item.label}
                        style={{
                          background: '#000000',
                          border: '1px solid #1c1c1e',
                          borderRadius: 10,
                          padding: '12px 14px',
                        }}
                      >
                        <div
                          style={{
                            fontFamily: 'var(--font-sans)',
                            fontWeight: 500,
                            fontSize: 10,
                            textTransform: 'uppercase' as const,
                            letterSpacing: '0.06em',
                            color: '#737373',
                            marginBottom: 4,
                          }}
                        >
                          {item.label}
                        </div>
                        <div
                          style={{
                            fontFamily: 'var(--font-sans)',
                            fontWeight: 600,
                            fontSize: 13,
                            color: (item as { green?: boolean }).green ? '#30d158' : '#ffffff',
                            lineHeight: 1.3,
                          }}
                        >
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Overview paragraph */}
                  <div
                    style={{
                      background: '#000000',
                      border: '1px solid #1c1c1e',
                      borderRadius: 10,
                      padding: '16px 18px',
                    }}
                  >
                    <p
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 300,
                        fontSize: 13,
                        color: '#a1a1a6',
                        lineHeight: 1.65,
                        margin: 0,
                      }}
                    >
                      {country.overview}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'Trade Intel' && (
                <div className="flex flex-col gap-3">
                  {country.trade_intel.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3"
                      style={{
                        background: '#000000',
                        border: '1px solid #1c1c1e',
                        borderRadius: 10,
                        padding: '14px 16px',
                      }}
                    >
                      <CheckCircle
                        size={14}
                        color="#30d158"
                        style={{ marginTop: 2, flexShrink: 0 }}
                        aria-hidden="true"
                      />
                      <p
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontWeight: 300,
                          fontSize: 13,
                          color: '#a1a1a6',
                          lineHeight: 1.5,
                          margin: 0,
                        }}
                      >
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'Risks' && (
                <div className="flex flex-col gap-3">
                  {country.risks.map((risk, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3"
                      style={{
                        background: '#000000',
                        border: '1px solid #1c1c1e',
                        borderLeft: '2px solid #ff453a',
                        borderRadius: 10,
                        padding: '14px 16px',
                      }}
                    >
                      <AlertTriangle
                        size={14}
                        color="#ff453a"
                        style={{ marginTop: 2, flexShrink: 0 }}
                        aria-hidden="true"
                      />
                      <p
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontWeight: 300,
                          fontSize: 13,
                          color: '#a1a1a6',
                          lineHeight: 1.5,
                          margin: 0,
                        }}
                      >
                        {risk}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'Opportunities' && (
                <div>
                  {linkedOpps.length === 0 ? (
                    <p
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 300,
                        fontSize: 13,
                        color: '#525252',
                      }}
                    >
                      No linked opportunities for {country.name}.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {linkedOpps.map((opp) => (
                        <div
                          key={opp.id}
                          style={{
                            background: '#000000',
                            border: '1px solid #1c1c1e',
                            borderRadius: 12,
                            padding: '16px 18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 16,
                          }}
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                style={{
                                  fontFamily: 'var(--font-mono)',
                                  fontSize: 10,
                                  color: '#525252',
                                }}
                              >
                                {opp.id}
                              </span>
                            </div>
                            <div
                              style={{
                                fontFamily: 'var(--font-sans)',
                                fontWeight: 600,
                                fontSize: 13,
                                color: '#ffffff',
                                marginBottom: 4,
                              }}
                            >
                              {opp.title}
                            </div>
                            <div
                              style={{
                                fontFamily: 'var(--font-sans)',
                                fontWeight: 400,
                                fontSize: 11,
                                color: '#737373',
                              }}
                            >
                              {opp.value} · {opp.duration}
                            </div>
                          </div>
                          <span
                            style={{
                              fontFamily: 'var(--font-sans)',
                              fontWeight: 600,
                              fontSize: 11,
                              color: opp.status === 'active' ? '#30d158' : opp.status === 'pending' ? '#ff9f0a' : '#737373',
                              background: '#1c1c1e',
                              borderRadius: 4,
                              padding: '3px 10px',
                              textTransform: 'uppercase' as const,
                              letterSpacing: '0.04em',
                              flexShrink: 0,
                            }}
                          >
                            {opp.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
