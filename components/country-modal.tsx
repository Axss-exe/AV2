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

          {/*
            Centering wrapper: plain (non-motion) element so its `transform:
            translate(-50%, -50%)` centering trick is never clobbered by
            framer-motion, which manages `transform` itself for the enter/exit
            animation on the inner motion.div (scale/y values compile to
            `transform` too, and would otherwise overwrite the centering).
          */}
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90vw',
              maxWidth: 720,
              maxHeight: '85vh',
              zIndex: 51,
            }}
          >
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              style={{
                width: '100%',
                maxHeight: '85vh',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 16,
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
                borderBottom: '1px solid var(--border-default)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  style={{
                    width: 40,
                    height: 28,
                    background: 'var(--border-default)',
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
                      color: 'var(--text-primary)',
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
                      color: 'var(--text-muted)',
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
                  background: 'var(--border-default)',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s, color 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--border-hover)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--border-default)';
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
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
                borderBottom: '1px solid var(--border-default)',
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
                      color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                      background: isActive ? 'var(--border-default)' : 'transparent',
                      border: 'none',
                      borderBottom: isActive ? '2px solid var(--text-primary)' : '2px solid transparent',
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
                    className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6"
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
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border-default)',
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
                            color: 'var(--text-muted)',
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
                            color: (item as { green?: boolean }).green ? 'var(--text-primary)' : 'var(--text-primary)',
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
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 10,
                      padding: '16px 18px',
                    }}
                  >
                    <p
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 300,
                        fontSize: 13,
                        color: 'var(--text-tertiary)',
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
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 10,
                        padding: '14px 16px',
                      }}
                    >
                      <CheckCircle
                        size={14}
                        color="var(--text-primary)"
                        style={{ marginTop: 2, flexShrink: 0 }}
                        aria-hidden="true"
                      />
                      <p
                        style={{
                          fontFamily: 'var(--font-sans)',
                          fontWeight: 300,
                          fontSize: 13,
                          color: 'var(--text-tertiary)',
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
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-default)',
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
                          color: 'var(--text-tertiary)',
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
                        color: 'var(--text-dim)',
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
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--border-default)',
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
                                  color: 'var(--text-dim)',
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
                                color: 'var(--text-primary)',
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
                                color: 'var(--text-muted)',
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
                              color: opp.status === 'active' ? 'var(--text-primary)' : opp.status === 'pending' ? '#ff9f0a' : 'var(--text-muted)',
                              background: 'var(--border-default)',
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
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
