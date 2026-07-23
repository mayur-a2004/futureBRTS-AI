import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Map, CheckSquare, GraduationCap, X, ChevronRight, ChevronLeft, Award, Compass, Sparkles } from "lucide-react";

interface WelcomeTourProps {
  onClose: () => void;
}

interface TourStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  targetId: string;
  mobileTargetId?: string;
  position: "right" | "left" | "top" | "bottom" | "center";
}

export default function WelcomeTour({ onClose }: WelcomeTourProps) {
  const [step, setStep] = useState(0);
  const [activeSlide, setActiveSlide] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Slides for Step 0 (Carousel)
  const welcomeSlides = [
    {
      title: "Welcome to FutureBRTS!",
      subtitle: "Your AI-Powered Project & Study Ecosystem",
      description: "We have built a unified environment where you can architect software, build business plans, generate production-ready code, and learn complex subjects with interactive virtual science labs.",
      icon: <Sparkles className="w-12 h-12 text-indigo-400 animate-pulse" />,
      color: "from-indigo-600 to-purple-600"
    },
    {
      title: "Build Anything (E-Builder)",
      subtitle: "Full-Stack Custom Project Architecture",
      description: "Convert your vision into reality. E-Builder compiles database models, authentication route systems, and complete responsive UI components with clean code in seconds.",
      icon: <Zap className="w-12 h-12 text-amber-400" />,
      color: "from-amber-600 to-orange-600"
    },
    {
      title: "Learn Smarter (Future Ed OS)",
      subtitle: "Interactive Simulations & AI Tutoring",
      description: "Learn with Minerva—your expert AI study tutor. Explore concepts via interactive 3D anatomy, virtual physics/chemistry labs, and challenge peers in 1v1 quiz battles.",
      icon: <GraduationCap className="w-12 h-12 text-emerald-400" />,
      color: "from-emerald-600 to-teal-600"
    }
  ];

  const steps: TourStep[] = [
    {
      title: "Welcome Overview",
      description: "Let's take a quick 1-minute visual tour of your new workstation.",
      icon: <Compass className="text-indigo-400" size={24} />,
      targetId: "",
      position: "center"
    },
    {
      title: "🏗️ E-Builder Workshop",
      description: "Use E-Builder to design full-stack applications, generate blueprints, schemas, and launch production code blocks dynamically.",
      icon: <Zap className="text-amber-400" size={24} />,
      targetId: "tour-nav-builder",
      mobileTargetId: "tour-mobile-builder",
      position: "right"
    },
    {
      title: "🗺️ Smart Study Roadmaps",
      description: "Generate customized learning tracks. Prerequisite concepts are structured in priority order (High/Medium/Low) for targeted study.",
      icon: <Map className="text-sky-400" size={24} />,
      targetId: "tour-nav-roadmap",
      mobileTargetId: "tour-mobile-roadmap",
      position: "right"
    },
    {
      title: "📅 Today's Study Tasks",
      description: "Stay consistent! Access your daily study checklist, practice challenges, and log homework tasks to maintain your learning streak.",
      icon: <CheckSquare className="text-emerald-400" size={24} />,
      targetId: "tour-nav-today-task",
      mobileTargetId: "tour-mobile-today-task",
      position: "right"
    },
    {
      title: "🎓 Future Education OS",
      description: "Step into our AI Student OS containing the Minerva tutor, Interactive virtual labs (Physics, Chemistry, Biology), 3D molecular structure models, and 1v1 quiz battles.",
      icon: <GraduationCap className="text-pink-400" size={24} />,
      targetId: "tour-nav-future-education-os",
      mobileTargetId: "tour-mobile-future-education",
      position: "right"
    },
    {
      title: "Ready to Build Your Future!",
      description: "Your workspace is ready. Build a new project or start a custom AI study mission now!",
      icon: <Award className="text-amber-400" size={24} />,
      targetId: "",
      position: "center"
    }
  ];

  // Update spotlight rect when step changes
  useEffect(() => {
    const activeStep = steps[step];
    if (!activeStep || !activeStep.targetId) {
      setTargetRect(null);
      return;
    }

    const updateRect = () => {
      // Choose mobile target if on small screen
      const targetId = window.innerWidth < 768 && activeStep.mobileTargetId
        ? activeStep.mobileTargetId
        : activeStep.targetId;

      const element = document.getElementById(targetId);
      if (element) {
        setTargetRect(element.getBoundingClientRect());
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    return () => window.removeEventListener("resize", updateRect);
  }, [step]);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem("fbrts_welcome_tour_completed", "true");
    onClose();
  };

  const activeStep = steps[step];

  // Determine floating card position based on spotlight
  const getCardStyle = (): React.CSSProperties => {
    if (!targetRect || activeStep.position === "center") {
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 9999
      };
    }

    const margin = 16;
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      // On mobile, position card above bottom bar or below top header
      if (activeStep.mobileTargetId) {
        return {
          position: "fixed",
          bottom: "80px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "calc(100% - 32px)",
          maxWidth: "380px",
          zIndex: 9999
        };
      }
    }

    // Desktop: position to the right of sidebar menu items
    return {
      position: "fixed",
      left: `${targetRect.right + margin}px`,
      top: `${targetRect.top + (targetRect.height / 2) - 80}px`,
      zIndex: 9999
    };
  };

  return (
    <div className="fixed inset-0 z-[9990] overflow-hidden">
      {/* 1. Backdrop Overlay with SVG Cutout Mask */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none z-[9995]">
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.x - 8}
                y={targetRect.y - 8}
                width={targetRect.width + 16}
                height={targetRect.height + 16}
                rx={12}
                ry={12}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(3, 2, 9, 0.85)"
          mask="url(#spotlight-mask)"
          className="pointer-events-auto cursor-default"
        />
      </svg>

      {/* 2. Floating Info Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          ref={cardRef}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.2 }}
          style={getCardStyle()}
          className="w-[360px] max-w-full bg-[#0c0a21]/90 backdrop-blur-2xl border border-indigo-500/30 rounded-3xl p-5 shadow-[0_0_50px_rgba(99,102,241,0.25)] flex flex-col gap-4 text-left"
        >
          {/* Welcome Screen (Step 0) - Slider Carousel */}
          {step === 0 ? (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-[10px] text-white">F</div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">FutureBRTS</span>
                </div>
                <button
                  onClick={handleComplete}
                  className="p-1 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Carousel Slide */}
              <div className="min-h-[220px] flex flex-col justify-center text-center px-2 py-4 bg-white/5 border border-white/5 rounded-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
                <div className="flex justify-center mb-3">
                  {welcomeSlides[activeSlide].icon}
                </div>
                <h3 className="text-base font-black text-white leading-tight">
                  {welcomeSlides[activeSlide].title}
                </h3>
                <h4 className="text-[11px] font-bold text-indigo-400 mt-1 uppercase tracking-wider">
                  {welcomeSlides[activeSlide].subtitle}
                </h4>
                <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                  {welcomeSlides[activeSlide].description}
                </p>
              </div>

              {/* Slider Dots */}
              <div className="flex justify-center gap-1.5 mt-1">
                {welcomeSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSlide(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeSlide === i ? "w-6 bg-indigo-500" : "w-1.5 bg-white/20"
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-2.5 mt-2">
                <button
                  onClick={handleComplete}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-bold rounded-xl text-xs transition-all text-center border border-white/5"
                >
                  Skip Tour
                </button>
                <button
                  onClick={() => {
                    if (activeSlide < welcomeSlides.length - 1) {
                      setActiveSlide(prev => prev + 1);
                    } else {
                      handleNext();
                    }
                  }}
                  className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black rounded-xl text-xs transition-all flex items-center justify-center gap-1 shadow-lg shadow-indigo-900/30"
                >
                  <span>{activeSlide === welcomeSlides.length - 1 ? "Start Tour" : "Next"}</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ) : step === steps.length - 1 ? (
            // Final Step (Congratulations card)
            <div className="flex flex-col gap-4 text-center py-2">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl flex items-center justify-center text-3xl shadow-lg shadow-orange-900/20">🎉</div>
              </div>
              <h3 className="text-lg font-black text-white leading-tight mt-1">{activeStep.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed px-2">
                {activeStep.description}
              </p>

              {/* Scholar Stats Mock Preview */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-3 text-left mt-1 flex flex-col gap-2">
                <div className="flex justify-between items-center text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                  <span>Level Progress</span>
                  <span>Lv. 1 Scholar</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full w-[35%]" />
                </div>
                <div className="flex justify-between text-[9px] text-gray-500 font-bold">
                  <span>XP: 350 / 1000</span>
                  <span>Coin Balance: 🪙 320 Gold</span>
                </div>
              </div>

              <div className="flex gap-2.5 mt-3">
                <button
                  onClick={handleBack}
                  className="flex items-center justify-center p-2.5 px-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl text-xs transition-all border border-white/5"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={handleComplete}
                  className="flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl text-xs transition-all shadow-lg shadow-emerald-900/30 uppercase tracking-wider"
                >
                  Let's Explore!
                </button>
              </div>
            </div>
          ) : (
            // Intermediate Steps (Spotlight cards)
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                  {activeStep.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-black text-white leading-tight uppercase tracking-wide">
                    {activeStep.title}
                  </h3>
                  <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5 block">
                    Step {step} of {steps.length - 2}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed min-h-[50px] mt-1">
                {activeStep.description}
              </p>

              <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5 gap-4">
                <button
                  onClick={handleComplete}
                  className="text-[10px] font-bold text-gray-500 hover:text-white transition-colors"
                >
                  Skip
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={handleBack}
                    className="flex items-center justify-center p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl text-xs transition-all border border-white/5"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={handleNext}
                    className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs transition-all flex items-center gap-1 shadow-lg shadow-indigo-900/20"
                  >
                    <span>Next</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
