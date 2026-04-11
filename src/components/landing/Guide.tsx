const steps = [
  { title: "Sign up for free", description: "Create your account as a student or small business owner. It only takes a minute." },
  { title: "Browse real projects", description: "Explore real-world challenges from small businesses that need your skills." },
  { title: "Publish your idea with AI", description: "Our AI helps you describe and post your project clearly, even without tech experience." },
  { title: "Apply or choose collaborators", description: "Students apply to projects, business owners select who they want to work with." },
  { title: "Build with AI support", description: "Get continuous feedback and suggestions from our AI Product Manager throughout the project." },
  { title: "Get results and recognition", description: "Businesses get real solutions. Students earn certificates to showcase their experience." },
];

export function Guide() {
  return (
    <section id="how" className="py-20 px-6 bg-white">
      <div className="max-w-2xl mx-auto">
        <div className="mb-12">
          <p className="text-xs font-medium uppercase tracking-widest text-[#38A3F1] mb-2">How it works</p>
          <h2 className="text-2xl font-semibold text-[#0D3A6E]">Six steps to your first real experience</h2>
        </div>
        <div className="flex flex-col">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-5">
              <div className="flex flex-col items-center w-7 flex-shrink-0">
                <div className="w-7 h-7 rounded-full bg-[#F0F7FF] border border-[#BAD8F7] flex items-center justify-center text-xs font-medium text-[#0D5FA6]">
                  {i + 1}
                </div>
                {i < steps.length - 1 && <div className="w-px bg-[#BAD8F7] flex-1 mt-1.5" />}
              </div>
              <div className={`pb-8 flex-1 ${i === steps.length - 1 ? "pb-0" : ""}`}>
                <p className="text-sm font-medium text-[#0D3A6E] mb-1">{step.title}</p>
                <p className="text-sm text-[#5B8DB8] leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-6 border-t border-[#BAD8F7]">
          <p className="text-sm text-[#93B8D4]">
            Dexpert is more than a platform — it is your first real step into the professional world.
          </p>
        </div>
      </div>
    </section>
  );
}