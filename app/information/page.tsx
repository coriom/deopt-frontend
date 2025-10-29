'use client';

import BackgroundImages from '../components/BackgroundImages';

export default function Information() {
  return (
    <div className="bg-[#111111] text-white font-sans min-h-screen flex flex-col relative overflow-hidden scroll-smooth">
      <BackgroundImages />

      <main className="flex-grow flex flex-col items-center justify-start px-6 py-12 text-left z-10 relative">
        <h1 className="text-4xl font-bold mb-10 text-center">Informations</h1>

        {/* Sommaire */}
        <section className="max-w-3xl mb-12 mx-auto">
          <h2 className="text-2xl font-semibold mb-4 text-emerald-400">Table of Contents</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li><a href="#part-1" className="hover:text-white underline-offset-4 hover:underline">Part 1: Introduction to Options</a></li>
            <li><a href="#part-2" className="hover:text-white underline-offset-4 hover:underline">Part 2: What is an Option?</a></li>
            <li><a href="#part-3" className="hover:text-white underline-offset-4 hover:underline">Part 3: The Two Main Types of Options</a></li>
            <li><a href="#part-4" className="hover:text-white underline-offset-4 hover:underline">Part 4: The Roles in an Option</a></li>
            <li><a href="#part-5" className="hover:text-white underline-offset-4 hover:underline">Part 5: Example Walkthrough</a></li>
            <li><a href="#part-6" className="hover:text-white underline-offset-4 hover:underline">Part 6: Why Use Options?</a></li>
            <li><a href="#conclusion" className="hover:text-white underline-offset-4 hover:underline">Conclusion on option</a></li>
            <li><a href="#workflow" className="hover:text-white underline-offset-4 hover:underline">Workflow</a></li>
            <li><a href="#part-9-futurs" className="hover:text-white underline-offset-4 hover:underline">Intoduction to Futurs</a></li>
            <li><a href="#part-10-futurs" className="hover:text-white underline-offset-4 hover:underline">Part 10: What is a Futures Contract?</a></li>
            <li><a href="#part-11-futurs" className="hover:text-white underline-offset-4 hover:underline">Part 11: The Two Positions in Futures</a></li>
            <li><a href="#part-12-futurs" className="hover:text-white underline-offset-4 hover:underline">Part 12: The Roles in a Futures Contract</a></li>
            <li><a href="#part-13-futurs" className="hover:text-white underline-offset-4 hover:underline">Part 13: Example Walkthrough</a></li>
            <li><a href="#part-14-futurs" className="hover:text-white underline-offset-4 hover:underline">Part 14: Why Use Futures?</a></li>
            <li><a href="#conclusion-futures" className="hover:text-white underline-offset-4 hover:underline">Conclusion on futurs</a></li>
          </ol>
        </section>

        {/* Part 1 */}
        <section id="part-1" className="scroll-mt-24 max-w-3xl space-y-4 mb-12 w-full">
          <h2 className="text-2xl font-semibold text-emerald-400">Part 1: Introduction to Futurs</h2>
          <p className="text-gray-300">
            Options are not just financial tools — they are choices.
            An option gives you the possibility to act without the obligation to do so. 
            Think of it like reserving the right to buy concert tickets at today’s price, 
            even if the price goes up tomorrow. You pay a small fee for that right, and later 
            you can decide: if the ticket price skyrockets, you exercise your right and save money; 
            if it drops, you simply let the reservation expire and lose only the small fee you paid.
          </p>
          <p className="text-gray-300">
            In finance, options work in a similar way: they allow investors to lock in a future
            buying or selling price of an asset while keeping the freedom to walk away if
            conditions turn unfavorable.
          </p>
          <p className="text-gray-300">
            This flexibility makes options one of the most versatile instruments in modern finance —
            used not only for speculation but also for risk management and income generation.
          </p>
        </section>

        {/* Part 2 */}
        <section id="part-2" className="scroll-mt-24 max-w-3xl space-y-4 mb-12 w-full">
          <h2 className="text-2xl font-semibold text-emerald-400">Part 2: What is an Option?</h2>
          <p className="text-gray-300">
            An option is a type of financial contract that gives its buyer a right, but not an obligation, 
            to trade an asset (called the underlying asset) at a predetermined price, within a certain time period.
          </p>

          <h3 className="text-xl font-semibold text-emerald-300">Here are the key elements: </h3>
          <ul className="list-disc list-inside space-y-3 text-gray-300">
            <li>
              <span className="font-semibold text-white">Underlying Asset: </span> 
              The product or instrument the option is linked to.  
              <span className="text-emerald-400 block">Example: Bitcoin, Ethereum, a stock, or a commodity.</span>
            </li>
            <li>
              <span className="font-semibold text-white">Strike Price (Exercise Price): </span> 
              The price at which the buyer can purchase or sell the underlying asset if they decide to exercise the option.
            </li>
            <li>
              <span className="font-semibold text-white">Expiration Date (Maturity): </span> 
              The date when the option expires. After this date, the contract becomes void.
            </li>
            <li>
              <span className="font-semibold text-white">Premium: </span> 
              The fee paid by the buyer to the seller for acquiring the option. It’s the cost of having the right.
            </li>
            <li>
              <span className="font-semibold text-white">Two Main Types of Options: </span>  
              <ul className="list-disc list-inside ml-6">
                <li><span className="text-emerald-400">Call Option</span> → The right to buy the underlying asset.</li>
                <li><span className="text-emerald-400">Put Option</span> → The right to sell the underlying asset.</li>
              </ul>
            </li>
            <li>
              <span className="font-semibold text-white">Exercise Styles: </span>  
              <ul className="list-disc list-inside ml-6">
                <li><span className="text-emerald-400">European Option:</span> Can only be exercised on the expiration date.</li>
                <li><span className="text-emerald-400">American Option:</span> Can be exercised at any time up to the expiration date.</li>
              </ul>
            </li>
          </ul>

          <p className="text-gray-300 italic">
            Think of a Call as a reservation to buy, and a Put as a reservation to sell.
          </p>
        </section>

        {/* Part 3 */}
        <section id="part-3" className="scroll-mt-24 max-w-3xl space-y-6 mb-12 w-full">
          <h2 className="text-2xl font-semibold text-emerald-400">Part 3: The Two Main Types of Options</h2>
          <p className="text-gray-300">
            Options come in two main forms: <span className="text-emerald-400">Call Options</span> and 
            <span className="text-emerald-400"> Put Options</span>. Both are powerful tools, but they serve different purposes.
          </p>

          {/* Call Option */}
          <div>
            <h3 className="text-xl font-semibold text-emerald-300">Call Option (Right to Buy)</h3>
            <ul className="list-disc list-inside ml-6 space-y-2 text-gray-300">
              <li><span className="font-semibold text-white">What it is:</span> A Call gives the buyer the right to buy the underlying asset at the strike price.</li>
              <li><span className="font-semibold text-white">When to use it:</span> If you believe the price of the asset will increase.</li>
              <li><span className="font-semibold text-white">Example:</span> You buy a Call option on Bitcoin with a strike price of $50,000. 
                  If Bitcoin rises to $60,000, you can still buy it at $50,000, capturing the profit.</li>
            </ul>
          </div>

          {/* Put Option */}
          <div>
            <h3 className="text-xl font-semibold text-emerald-300">Put Option (Right to Sell)</h3>
            <ul className="list-disc list-inside ml-6 space-y-2 text-gray-300">
              <li><span className="font-semibold text-white">What it is:</span> A Put gives the buyer the right to sell the underlying asset at the strike price.</li>
              <li><span className="font-semibold text-white">When to use it:</span> If you believe the price of the asset will decrease.</li>
              <li><span className="font-semibold text-white">Example:</span> You buy a Put option on Ethereum with a strike price of $3,000. 
                  If Ethereum falls to $2,500, you can still sell it for $3,000, limiting your losses.</li>
            </ul>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto">
            <table className="table-auto w-full border border-gray-700 text-gray-300">
              <thead className="bg-neutral-900 text-emerald-400">
                <tr>
                  <th className="px-4 py-2 border border-gray-700">Feature</th>
                  <th className="px-4 py-2 border border-gray-700">Call Option</th>
                  <th className="px-4 py-2 border border-gray-700">Put Option</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 border border-gray-700">Right to</td>
                  <td className="px-4 py-2 border border-gray-700">Buy the asset</td>
                  <td className="px-4 py-2 border border-gray-700">Sell the asset</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border border-gray-700">Best if price</td>
                  <td className="px-4 py-2 border border-gray-700">Goes up</td>
                  <td className="px-4 py-2 border border-gray-700">Goes down</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border border-gray-700">Example use case</td>
                  <td className="px-4 py-2 border border-gray-700">Speculating on a bull market</td>
                  <td className="px-4 py-2 border border-gray-700">Protecting against a market downturn</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border border-gray-700">Potential Profit</td>
                  <td className="px-4 py-2 border border-gray-700">Unlimited (if price keeps rising)</td>
                  <td className="px-4 py-2 border border-gray-700">Significant (as price falls)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border border-gray-700">Maximum Loss</td>
                  <td className="px-4 py-2 border border-gray-700">Limited to the premium paid</td>
                  <td className="px-4 py-2 border border-gray-700">Limited to the premium paid</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* European vs American */}
          <div>
            <h3 className="text-xl font-semibold text-emerald-300">European vs. American Options</h3>
            <ul className="list-disc list-inside ml-6 space-y-2 text-gray-300">
              <li><span className="font-semibold text-white">European Option:</span> Can only be exercised on the expiration date.</li>
              <li><span className="font-semibold text-white">American Option:</span> Can be exercised any time before expiration.</li>
              <li><span className="text-emerald-400">In DeOpt V1, the flexibility will depend on the type of contract you choose.</span></li>
            </ul>
          </div>

          <p className="text-gray-300 italic">
            Quick takeaway: Buy a <span className="text-emerald-400">Call</span> if you expect prices to rise. 
            Buy a <span className="text-emerald-400">Put</span> if you expect prices to fall.  
            Your maximum loss is always the premium you paid.
          </p>
        </section>

        {/* Part 4 */}
        <section id="part-4" className="scroll-mt-24 max-w-5xl space-y-6 mb-12 w-full">
          <h2 className="text-2xl font-semibold text-emerald-400">Part 4: The Roles in an Option</h2>
          <p className="text-gray-300">
            Every option involves two parties:
          </p>

          {/* Buyer */}
          <div>
            <h3 className="text-xl font-semibold text-emerald-300">The Buyer (Holder)</h3>
            <ul className="list-disc list-inside ml-6 space-y-2 text-gray-300">
              <li><span className="font-semibold text-white">Pays the Premium:</span> This is the cost of acquiring the option.</li>
              <li><span className="font-semibold text-white">Has the Right, Not the Obligation:</span>
                <ul className="list-disc list-inside ml-6">
                  <li>For a Call: the right to buy the asset.</li>
                  <li>For a Put: the right to sell the asset.</li>
                </ul>
              </li>
              <li><span className="font-semibold text-white">Risk:</span> Limited to the premium paid.</li>
              <li><span className="font-semibold text-white">Potential Reward:</span>
                <ul className="list-disc list-inside ml-6">
                  <li>For Calls: Unlimited gains if the price rises.</li>
                  <li>For Puts: Large gains if the price drops.</li>
                </ul>
              </li>
              <li><span className="font-semibold text-white">Analogy:</span> Like paying for insurance — you pay a fee, and if the event happens, you’re protected.</li>
            </ul>
          </div>

          {/* Seller */}
          <div>
            <h3 className="text-xl font-semibold text-emerald-300">The Seller (Writer)</h3>
            <ul className="list-disc list-inside ml-6 space-y-2 text-gray-300">
              <li><span className="font-semibold text-white">Receives the Premium:</span> Immediate income from selling the option.</li>
              <li><span className="font-semibold text-white">Has the Obligation:</span> Must fulfill the contract if the buyer exercises the option.</li>
              <li><span className="font-semibold text-white">Risk:</span>
                <ul className="list-disc list-inside ml-6">
                  <li>For Calls: Potentially unlimited losses if the price skyrockets.</li>
                  <li>For Puts: Significant losses if the price collapses.</li>
                </ul>
              </li>
              <li><span className="font-semibold text-white">Potential Reward:</span> Limited to the premium received.</li>
              <li><span className="font-semibold text-white">Analogy:</span> Like being the insurer — you collect the fee, but must cover the payout if the event happens.</li>
            </ul>
          </div>

          {/* Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="text-center">
              <img
                src="/image/Options/call_roles.png"
                alt="Call option buyer and seller diagram"
                className="rounded-lg shadow-lg mx-auto"
              />
              <p className="text-sm text-gray-400 mt-2">Illustration: Call Option (Buyer & Seller)</p>
            </div>
            <div className="text-center">
              <img
                src="/image/Options/put_roles.png"
                alt="Put option buyer and seller diagram"
                className="rounded-lg shadow-lg mx-auto"
              />
              <p className="text-sm text-gray-400 mt-2">Illustration: Put Option (Buyer & Seller)</p>
            </div>
          </div>

          {/* Risk / Reward Table */}
          <div className="overflow-x-auto mt-6">
            <table className="table-auto w-full border border-gray-700 text-gray-300">
              <thead className="bg-neutral-900 text-emerald-400">
                <tr>
                  <th className="px-4 py-2 border border-gray-700">Role</th>
                  <th className="px-4 py-2 border border-gray-700">Risk</th>
                  <th className="px-4 py-2 border border-gray-700">Reward</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 border border-gray-700">Buyer</td>
                  <td className="px-4 py-2 border border-gray-700">Limited to premium</td>
                  <td className="px-4 py-2 border border-gray-700">Unlimited (Call) / Large (Put)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border border-gray-700">Seller</td>
                  <td className="px-4 py-2 border border-gray-700">Potentially very high</td>
                  <td className="px-4 py-2 border border-gray-700">Limited to premium received</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-gray-300 italic mt-4">
            Key Insight: Buyers take limited risk for high potential gain.  
            Sellers take high risk for limited gain.
          </p>
        </section>

        {/* Part 5 */}
        <section id="part-5" className="scroll-mt-24 max-w-3xl space-y-6 mb-12 w-full">
          <h2 className="text-2xl font-semibold text-emerald-400">Part 5: Example Walkthrough</h2>
          <p className="text-gray-300">
            Let’s take a practical example to see how an option works in real life.
          </p>

          {/* Call Option Example */}
          <div>
            <h3 className="text-xl font-semibold text-emerald-300">Scenario: A Call Option on Bitcoin</h3>
            <ul className="list-disc list-inside ml-6 space-y-2 text-gray-300">
              <li><span className="font-semibold text-white">Underlying Asset:</span> Bitcoin</li>
              <li><span className="font-semibold text-white">Strike Price:</span> $50,000</li>
              <li><span className="font-semibold text-white">Expiration:</span> 1 month from today</li>
              <li><span className="font-semibold text-white">Premium Paid:</span> $2,000</li>
            </ul>

            <p className="text-gray-300 mt-2">
              You believe Bitcoin’s price will rise, so you buy a Call option.
            </p>

            <h4 className="text-lg font-semibold text-emerald-400 mt-4">Outcome 1: Price Goes Up (Profit Scenario)</h4>
            <ul className="list-disc list-inside ml-6 space-y-2 text-gray-300">
              <li>At expiration, Bitcoin is trading at $60,000.</li>
              <li>You exercise your right to buy at $50,000.</li>
              <li>You immediately own an asset worth $60,000.</li>
              <li><span className="font-semibold">Gross Gain:</span> $10,000</li>
              <li><span className="font-semibold">Net Profit:</span> $10,000 – $2,000 (premium) = $8,000</li>
            </ul>

            <h4 className="text-lg font-semibold text-emerald-400 mt-4">Outcome 2: Price Stays the Same or Drops (Loss Scenario)</h4>
            <ul className="list-disc list-inside ml-6 space-y-2 text-gray-300">
              <li>At expiration, Bitcoin is trading at $48,000.</li>
              <li>Buying at $50,000 would be a loss.</li>
              <li>You decide not to exercise the option.</li>
              <li><span className="font-semibold">Loss:</span> Only the premium of $2,000.</li>
            </ul>

            <div className="bg-neutral-800 p-4 rounded-lg mt-4">
              <h5 className="font-semibold text-emerald-400">Key Takeaway</h5>
              <p className="text-gray-300">
                Maximum Loss: $2,000 (the premium paid).  
                Potential Profit: Unlimited, depending on how high the price goes.  
                This limited risk and high potential reward is why many investors use options.
              </p>
            </div>
          </div>

          {/* Put Option Example */}
          <div>
            <h3 className="text-xl font-semibold text-emerald-300">Scenario: A Put Option on Ethereum</h3>
            <ul className="list-disc list-inside ml-6 space-y-2 text-gray-300">
              <li><span className="font-semibold text-white">Underlying Asset:</span> Ethereum</li>
              <li><span className="font-semibold text-white">Strike Price:</span> $3,000</li>
              <li><span className="font-semibold text-white">Expiration:</span> 1 month from today</li>
              <li><span className="font-semibold text-white">Premium Paid:</span> $150</li>
            </ul>

            <p className="text-gray-300 mt-2">
              You’re worried Ethereum’s price might fall, so you buy a Put option to protect yourself.
            </p>

            <h4 className="text-lg font-semibold text-emerald-400 mt-4">Outcome 1: Price Falls (Profit Scenario)</h4>
            <ul className="list-disc list-inside ml-6 space-y-2 text-gray-300">
              <li>At expiration, Ethereum is trading at $2,500.</li>
              <li>You exercise your right to sell at $3,000.</li>
              <li>You sell for $500 more than the market price.</li>
              <li><span className="font-semibold">Gross Gain:</span> $500</li>
              <li><span className="font-semibold">Net Profit:</span> $500 – $150 (premium) = $350</li>
            </ul>

            <h4 className="text-lg font-semibold text-emerald-400 mt-4">Outcome 2: Price Stays the Same or Rises (Loss Scenario)</h4>
            <ul className="list-disc list-inside ml-6 space-y-2 text-gray-300">
              <li>At expiration, Ethereum is trading at $3,200.</li>
              <li>Selling at $3,000 would be a loss.</li>
              <li>You decide not to exercise the option.</li>
              <li><span className="font-semibold">Loss:</span> Only the premium of $150.</li>
            </ul>

            <div className="bg-neutral-800 p-4 rounded-lg mt-4">
              <h5 className="font-semibold text-emerald-400">Key Takeaway</h5>
              <p className="text-gray-300">
                Maximum Loss: $150 (the premium paid).  
                Potential Profit: Grows as the asset price falls.  
                A Put acts like insurance against falling prices.
              </p>
            </div>
          </div>

          <p className="text-gray-300 italic mt-6">
            Together, Calls and Puts give traders and investors tools to bet on or protect against any market movement.
          </p>
        </section>

        {/* Part 6 */}
        <section id="part-6" className="scroll-mt-24 max-w-3xl space-y-6 mb-12 w-full">
          <h2 className="text-2xl font-semibold text-emerald-400">Part 6: Why Use Options?</h2>
          <p className="text-gray-300">
            Options are more than just speculative tools. They provide flexibility and control
            that traditional investments can’t always offer. Here are the three most common
            reasons investors use them:
          </p>

          {/* Hedging */}
          <div>
            <h3 className="text-xl font-semibold text-emerald-300">1. Hedging (Protection)</h3>
            <ul className="list-disc list-inside ml-6 space-y-2 text-gray-300">
              <li><span className="font-semibold text-white">Goal:</span> Protect against unfavorable price movements.</li>
              <li><span className="font-semibold text-white">How it works:</span>
                <ul className="list-disc list-inside ml-6">
                  <li>A farmer sells a Put option on wheat to ensure he can sell his crop at a minimum price.</li>
                  <li>A crypto miner buys a Put option on Bitcoin to protect earnings if the price falls.</li>
                </ul>
              </li>
              <li><span className="font-semibold text-white">Benefit:</span> Reduces risk — like buying insurance.</li>
            </ul>
          </div>

          {/* Speculation */}
          <div>
            <h3 className="text-xl font-semibold text-emerald-300">2. Speculation (Profit Opportunities)</h3>
            <ul className="list-disc list-inside ml-6 space-y-2 text-gray-300">
              <li><span className="font-semibold text-white">Goal:</span> Benefit from expected price movements.</li>
              <li><span className="font-semibold text-white">How it works:</span>
                <ul className="list-disc list-inside ml-6">
                  <li>If you expect the price of Ethereum to rise, you buy a Call option.</li>
                  <li>If you expect it to fall, you buy a Put option.</li>
                </ul>
              </li>
              <li>
                <span className="font-semibold text-white">Benefit:</span>
                <ul className="list-disc list-inside ml-6">
                  <li>Profit from market moves with a smaller initial investment.</li>
                  <li>Maximum loss is limited to the premium.</li>
                </ul>
              </li>
            </ul>
          </div>

          {/* Income Generation */}
          <div>
            <h3 className="text-xl font-semibold text-emerald-300">3. Income Generation</h3>
            <ul className="list-disc list-inside ml-6 space-y-2 text-gray-300">
              <li><span className="font-semibold text-white">Goal:</span> Earn regular premiums.</li>
              <li><span className="font-semibold text-white">How it works:</span>
                <ul className="list-disc list-inside ml-6">
                  <li>Investors sell (write) options to collect the premiums from buyers.</li>
                  <li>If the option expires worthless, they keep the premium as profit.</li>
                </ul>
              </li>
              <li><span className="font-semibold text-white">Example:</span> A trader sells Call options on tokens they already own to earn extra income.</li>
              <li><span className="font-semibold text-white">Risk:</span> The seller must deliver if the buyer exercises the option.</li>
            </ul>
          </div>

          {/* Quick Recap */}
          <div className="bg-neutral-800 p-4 rounded-lg mt-4">
            <h4 className="font-semibold text-emerald-400">Quick Recap</h4>
            <ul className="list-disc list-inside ml-6 text-gray-300">
              <li><span className="font-semibold text-white">Hedging:</span> Protect against losses.</li>
              <li><span className="font-semibold text-white">Speculation:</span> Profit from market moves.</li>
              <li><span className="font-semibold text-white">Income:</span> Earn premiums by selling options.</li>
            </ul>
            <p className="text-gray-300 mt-2">
              Options are versatile tools that adapt to many investment strategies — whether you
              want to secure your capital, take advantage of price swings, or generate passive
              income.
            </p>
          </div>
        </section>

        {/* Conclusion */}
        <section id="conclusion" className="scroll-mt-24 max-w-3xl space-y-4 mb-12 w-full">
          <h2 className="text-2xl font-semibold text-emerald-400">Conclusion on options</h2>
          <p className="text-gray-300">
            Options are powerful financial instruments that give you the right, but not the obligation,
            to buy or sell an asset at a fixed price within a set period. With their unique balance of 
            limited risk and flexible strategies, they can be used to protect investments, seize profit 
            opportunities, or generate income.
          </p>
          <p className="text-gray-300">
            Understanding how options work is the first step toward unlocking their full potential.
            Now, let’s see how <span className="text-emerald-400 font-semibold">DeOpt V1</span> brings these traditional principles into a 
            decentralized and transparent environment, reshaping the way options are traded.
          </p>
        </section>

        {/* Workflow */}
        <section id="workflow" className="scroll-mt-24 max-w-5xl space-y-4 mb-12 w-full">
          <h2 className="text-2xl font-semibold text-emerald-400">Workflow</h2>
          <p className="text-gray-300">
            This diagram summarizes the DeOpt V1 workflow — from creating an option to exercise and settlement.
            It shows how buyers, sellers, and the smart contract interact at each step.
          </p>

          <div className="flex justify-center">
            <img
              src="/image/Workflow/workflow_DeOpt1.png"
              alt="DeOpt V1 Workflow Diagram"
              className="rounded-lg shadow-lg max-w-full h-auto"
            />
          </div>

          <p className="text-sm text-gray-400 text-center">
            Tip: Hover the image to zoom with your browser if you want to inspect details.
          </p>
        </section>
      </main>
      
      {/* Part 1 */}
      <section id="part-9-futurs" className="scroll-mt-24 max-w-5xl mx-auto space-y-4 mb-12 w-full">
        <h2 className="text-2xl font-semibold text-emerald-400">Part 9: Introduction to Futurs</h2>
        <p className="text-gray-300">
          Options are not just financial tools — they are choices.
          An option gives you the possibility to act without the obligation to do so. 
          Think of it like reserving the right to buy concert tickets at today’s price, 
          even if the price goes up tomorrow. You pay a small fee for that right, and later 
          you can decide: if the ticket price skyrockets, you exercise your right and save money; 
          if it drops, you simply let the reservation expire and lose only the small fee you paid.
        </p>
        <p className="text-gray-300">
          In finance, options work in a similar way: they allow investors to lock in a future
          buying or selling price of an asset while keeping the freedom to walk away if
          conditions turn unfavorable.
        </p>
        <p className="text-gray-300">
          This flexibility makes options one of the most versatile instruments in modern finance —
          used not only for speculation but also for risk management and income generation.
        </p>

        {/* New Futures section */}
        <h3 className="text-xl font-semibold text-emerald-300 mt-6">Futures: Obligations Instead of Choices</h3>
        <p className="text-gray-300">
          Futures are not just financial contracts — they are commitments.
          A futures contract is an agreement between two parties to buy or sell an asset at a predetermined price on a specific date in the future. Unlike options, futures are obligations: if you agree to the contract, you must honor it when it expires.
        </p>
        <p className="text-gray-300">
          Think of it like agreeing today to sell 100 bags of coffee to a buyer at a fixed price three months from now. Whether the market price goes up or down, you both must follow through with the deal. If the market price is higher than the agreed price, the buyer benefits; if it’s lower, the seller benefits.
        </p>
        <p className="text-gray-300">
          In finance, futures work in exactly the same way — they allow investors, traders, and businesses to lock in a buying or selling price today for a transaction that will happen later.
          This predictability makes futures one of the most widely used tools in modern finance — not only for speculation on price movements but also for hedging risks and ensuring price stability for producers and consumers.
        </p>
      </section>

            {/* Part 2 Futures */}
      <section id="part-9-futures" className="scroll-mt-24 max-w-3xl mx-auto space-y-4 mb-12 w-full">
        <h2 className="text-2xl font-semibold text-emerald-400">Part 10: What is a Futures Contract?</h2>
        <p className="text-gray-300">
          A futures contract is a standardized financial agreement between two parties to buy or sell an asset 
          (called the underlying asset) at a fixed price on a specified future date.
          Unlike options, both the buyer and the seller of a futures contract are <span className="font-semibold text-white">obligated </span> 
          to fulfill the agreement at expiration.
        </p>

        <h3 className="text-xl font-semibold text-emerald-300">Here are the key elements: </h3>
        <ul className="list-disc list-inside space-y-3 text-gray-300">
          <li>
            <span className="font-semibold text-white">Underlying Asset: </span> 
            The product or instrument the futures contract is based on.
            <span className="text-emerald-400 block">Examples: Bitcoin, Ethereum, crude oil, wheat, stock indices.</span>
          </li>
          <li>
            <span className="font-semibold text-white">Futures Price (Entry Price): </span> 
            The price agreed upon today for the future transaction. This is the reference point for calculating profits and losses.
          </li>
          <li>
            <span className="font-semibold text-white">Contract Size: </span> 
            The quantity of the underlying asset covered by one futures contract.
            <span className="text-emerald-400 block">Example: 1 Bitcoin per contract, 5,000 bushels of wheat, etc.</span>
          </li>
          <li>
            <span className="font-semibold text-white">Expiration Date (Delivery Date): </span> 
            The date when the contract must be settled.
          </li>
          <li>
            <span className="font-semibold text-white">Settlement Type:</span>  
            <ul className="list-disc list-inside ml-6">
              <li><span className="text-emerald-400">Physical Delivery:</span> The actual asset is delivered at expiration.</li>
              <li><span className="text-emerald-400">Cash Settlement:</span> Only the profit or loss is exchanged in cash or tokens.</li>
            </ul>
          </li>
          <li>
            <span className="font-semibold text-white">Margin Requirement: </span> 
            A deposit (collateral) required from both parties to ensure they can meet their obligations. Futures are 
            <span className="text-emerald-400"> marked-to-market daily</span>, meaning profits and losses are settled every day until the contract expires.
          </li>
        </ul>

        <p className="text-gray-300 italic">
          Think of a futures contract as a handshake today for a trade that will happen tomorrow — with both sides committed, regardless of market movements.
        </p>
      </section>

      {/* Part 3 Futures */}
      <section id="part-11-futures" className="scroll-mt-24 max-w-3xl mx-auto space-y-6 mb-12 w-full">
        <h2 className="text-2xl font-semibold text-emerald-400">Part 11: The Two Positions in Futures</h2>
        <p className="text-gray-300">
          In futures trading, there are no “calls” or “puts” like in options — instead, traders take one of two positions:
          <span className="text-emerald-400"> Long</span> or <span className="text-emerald-400">Short</span>. Both are powerful tools, but they serve opposite purposes.
        </p>

        {/* Long Futures */}
        <div>
          <h3 className="text-xl font-semibold text-emerald-300">Long Futures (Buyer)</h3>
          <ul className="list-disc list-inside ml-6 space-y-2 text-gray-300">
            <li>
              <span className="font-semibold text-white">What it is:</span> Taking a long position means agreeing to buy the underlying asset
              at the futures price when the contract expires.
            </li>
            <li>
              <span className="font-semibold text-white">When to use it:</span> If you believe the price of the asset will increase.
            </li>
            <li>
              <span className="font-semibold text-white">Example:</span> You go long on a Bitcoin futures contract with an entry price of $50,000.
              If Bitcoin rises to $60,000, you can still buy at $50,000, profiting from the $10,000 difference.
            </li>
          </ul>
        </div>

        {/* Short Futures */}
        <div>
          <h3 className="text-xl font-semibold text-emerald-300">Short Futures (Seller)</h3>
          <ul className="list-disc list-inside ml-6 space-y-2 text-gray-300">
            <li>
              <span className="font-semibold text-white">What it is:</span> Taking a short position means agreeing to sell the underlying asset
              at the futures price when the contract expires.
            </li>
            <li>
              <span className="font-semibold text-white">When to use it:</span> If you believe the price of the asset will decrease.
            </li>
            <li>
              <span className="font-semibold text-white">Example:</span> You go short on an Ethereum futures contract with an entry price of $3,000.
              If Ethereum falls to $2,500, you can still sell at $3,000, earning the $500 difference.
            </li>
          </ul>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="table-auto w-full border border-gray-700 text-gray-300">
            <thead className="bg-neutral-900 text-emerald-400">
              <tr>
                <th className="px-4 py-2 border border-gray-700">Feature</th>
                <th className="px-4 py-2 border border-gray-700">Long Futures</th>
                <th className="px-4 py-2 border border-gray-700">Short Futures</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-2 border border-gray-700">Obligation</td>
                <td className="px-4 py-2 border border-gray-700">Buy at the agreed price</td>
                <td className="px-4 py-2 border border-gray-700">Sell at the agreed price</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border border-gray-700">Best if price</td>
                <td className="px-4 py-2 border border-gray-700">Goes up</td>
                <td className="px-4 py-2 border border-gray-700">Goes down</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border border-gray-700">Example use case</td>
                <td className="px-4 py-2 border border-gray-700">Speculating on a bull market</td>
                <td className="px-4 py-2 border border-gray-700">Hedging against a price drop</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border border-gray-700">Potential Profit</td>
                <td className="px-4 py-2 border border-gray-700">Unlimited (as price rises)</td>
                <td className="px-4 py-2 border border-gray-700">Unlimited (as price falls)</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border border-gray-700">Potential Loss</td>
                <td className="px-4 py-2 border border-gray-700">Unlimited (as price falls)</td>
                <td className="px-4 py-2 border border-gray-700">Unlimited (as price rises)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-gray-300 italic">
          Quick takeaway: Go <span className="text-emerald-400">Long</span> if you expect prices to rise. Go
          <span className="text-emerald-400"> Short</span> if you expect prices to fall. Futures are
          <span className="text-emerald-400"> zero-sum</span> contracts — one side’s gain is exactly the other side’s loss.
        </p>
      </section>

      {/* Part 4 Futures */}
      <section id="part-12-futures" className="scroll-mt-24 max-w-5xl mx-auto space-y-6 mb-12 w-full">
        <h2 className="text-2xl font-semibold text-emerald-400">Part 12: The Roles in a Futures Contract</h2>
        <p className="text-gray-300">
          Every futures contract involves two opposing positions: one trader is <span className="text-emerald-400">long</span> and the other is
          <span className="text-emerald-400"> short</span>. Unlike options, both parties have an obligation to fulfill the contract at expiration.
        </p>

        {/* Long Position */}
        <div>
          <h3 className="text-xl font-semibold text-emerald-300">The Long Position (Buyer)</h3>
          <ul className="list-disc list-inside ml-6 space-y-2 text-gray-300">
            <li><span className="font-semibold text-white">Obligation:</span> Must buy the underlying asset at the agreed futures price when the contract expires.</li>
            <li><span className="font-semibold text-white">Objective:</span> Profit if the price increases.</li>
            <li><span className="font-semibold text-white">Risk:</span> Unlimited if the price falls significantly.</li>
            <li><span className="font-semibold text-white">Potential Reward:</span> Unlimited if the price rises.</li>
            <li><span className="font-semibold text-white">Example:</span> Long at $50,000 → if market price is $60,000 at expiration, profit is $10,000 per contract.</li>
          </ul>
        </div>

        {/* Short Position */}
        <div>
          <h3 className="text-xl font-semibold text-emerald-300">The Short Position (Seller)</h3>
          <ul className="list-disc list-inside ml-6 space-y-2 text-gray-300">
            <li><span className="font-semibold text-white">Obligation:</span> Must sell the underlying asset at the agreed futures price when the contract expires.</li>
            <li><span className="font-semibold text-white">Objective:</span> Profit if the price decreases.</li>
            <li><span className="font-semibold text-white">Risk:</span> Unlimited if the price rises significantly.</li>
            <li><span className="font-semibold text-white">Potential Reward:</span> Unlimited if the price falls.</li>
            <li><span className="font-semibold text-white">Example:</span> Short at $50,000 → if market price is $40,000 at expiration, profit is $10,000 per contract.</li>
          </ul>
        </div>

        {/* Margin Requirement */}
        <div className="bg-neutral-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-emerald-400">Margin Requirement</h3>
          <ul className="list-disc list-inside ml-6 space-y-2 text-gray-300">
            <li>Both long and short traders must deposit margin (collateral) to open a futures position.</li>
            <li>This acts as a guarantee they can cover potential losses.</li>
            <li><span className="font-semibold text-white">Initial margin</span> (to open) and <span className="font-semibold text-white">maintenance margin</span> (minimum to keep position open).</li>
          </ul>
        </div>

        {/* Mark-to-Market */}
        <div className="bg-neutral-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-emerald-400">Mark-to-Market</h3>
          <ul className="list-disc list-inside ml-6 space-y-2 text-gray-300">
            <li>Futures are marked-to-market daily — P&amp;L is computed each day from the current market price.</li>
            <li>Daily gains are credited and losses debited to the trader’s margin account.</li>
            <li>If balance falls below maintenance margin, a <span className="font-semibold text-white">margin call</span> requires adding funds.</li>
          </ul>
        </div>

          {/* Images */}
          <div className="flex justify-center mt-6">
            <div className="text-center">
              <img
                src="/image/Futurs/futur_roles.png"
                alt="Futures buyer and seller diagram"
                className="rounded-lg shadow-lg mx-auto max-w-md w-full"
              />
              <p className="text-sm text-gray-400 mt-2">Illustration: Short and Long on futures</p>
            </div>
          </div>

        {/* Risk/Reward Table */}
        <div className="overflow-x-auto">
          <table className="table-auto w-full border border-gray-700 text-gray-300">
            <thead className="bg-neutral-900 text-emerald-400">
              <tr>
                <th className="px-4 py-2 border border-gray-700">Position</th>
                <th className="px-4 py-2 border border-gray-700">Risk</th>
                <th className="px-4 py-2 border border-gray-700">Reward</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-2 border border-gray-700">Long</td>
                <td className="px-4 py-2 border border-gray-700">Unlimited loss if price drops</td>
                <td className="px-4 py-2 border border-gray-700">Unlimited profit if price rises</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border border-gray-700">Short</td>
                <td className="px-4 py-2 border border-gray-700">Unlimited loss if price rises</td>
                <td className="px-4 py-2 border border-gray-700">Unlimited profit if price drops</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-gray-300 italic">
          Key Insight: Both sides face unlimited potential loss because they are obligated to transact at the futures price, no matter how far the market moves.
          Leverage can amplify both gains and losses.
        </p>
      </section>

      {/* Part 5 Futures */}
      <section id="part-13-futures" className="scroll-mt-24 max-w-3xl mx-auto space-y-6 mb-12 w-full">
        <h2 className="text-2xl font-semibold text-emerald-400">Part 13: Example Walkthrough</h2>
        <p className="text-gray-300">
          Let’s take a practical example to see how a futures contract works in real life.
        </p>

        {/* Scenario */}
        <div>
          <h3 className="text-xl font-semibold text-emerald-300">Scenario: Bitcoin Futures Contract</h3>
          <ul className="list-disc list-inside ml-6 space-y-2 text-gray-300">
            <li><span className="font-semibold text-white">Underlying Asset:</span> Bitcoin</li>
            <li><span className="font-semibold text-white">Contract Size:</span> 1 BTC</li>
            <li><span className="font-semibold text-white">Futures Price (Entry Price):</span> $50,000</li>
            <li><span className="font-semibold text-white">Expiration:</span> 1 month from today</li>
            <li><span className="font-semibold text-white">Margin Requirement:</span> $5,000 (10% of contract value)</li>
          </ul>
        </div>

        {/* Outcome 1 */}
        <div className="bg-neutral-800 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-emerald-400">Outcome 1: Long Futures (Buyer) — Price Goes Up</h4>
          <ul className="list-disc list-inside ml-6 space-y-2 text-gray-300">
            <li>You go long 1 BTC futures contract at $50,000.</li>
            <li>At expiration, Bitcoin is trading at $60,000.</li>
            <li>You are obligated to buy at $50,000.</li>
            <li><span className="font-semibold">Profit:</span> $60,000 – $50,000 = $10,000 per contract.</li>
            <li><span className="font-semibold">Return on Margin:</span> $10,000 profit on $5,000 margin = +200%.</li>
          </ul>
          <p className="text-emerald-400 italic">The market moved in your favor — you earned a leveraged gain.</p>
        </div>

        {/* Outcome 2 */}
        <div className="bg-neutral-800 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-emerald-400">Outcome 2: Long Futures (Buyer) — Price Drops</h4>
          <ul className="list-disc list-inside ml-6 space-y-2 text-gray-300">
            <li>At expiration, Bitcoin is trading at $45,000.</li>
            <li>You must still buy at $50,000.</li>
            <li><span className="font-semibold">Loss:</span> $50,000 – $45,000 = $5,000 per contract.</li>
            <li><span className="font-semibold">Return on Margin:</span> $5,000 loss on $5,000 margin = –100%.</li>
          </ul>
          <p className="text-emerald-400 italic">The market moved against you — your margin is fully lost.</p>
        </div>

        {/* Outcome 3 */}
        <div className="bg-neutral-800 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-emerald-400">Outcome 3: Short Futures (Seller) — Price Drops</h4>
          <ul className="list-disc list-inside ml-6 space-y-2 text-gray-300">
            <li>You go short 1 BTC futures contract at $50,000.</li>
            <li>At expiration, Bitcoin is trading at $45,000.</li>
            <li>You are obligated to sell at $50,000.</li>
            <li><span className="font-semibold">Profit:</span> $50,000 – $45,000 = $5,000 per contract.</li>
          </ul>
          <p className="text-emerald-400 italic">The market moved in your favor — you profited from the price drop.</p>
        </div>

        {/* Outcome 4 */}
        <div className="bg-neutral-800 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-emerald-400">Outcome 4: Short Futures (Seller) — Price Goes Up</h4>
          <ul className="list-disc list-inside ml-6 space-y-2 text-gray-300">
            <li>At expiration, Bitcoin is trading at $60,000.</li>
            <li>You must still sell at $50,000.</li>
            <li><span className="font-semibold">Loss:</span> $60,000 – $50,000 = $10,000 per contract.</li>
          </ul>
          <p className="text-emerald-400 italic">The market moved against you — you suffered a large loss.</p>
        </div>

        {/* Key Takeaways */}
        <div className="bg-neutral-900 p-4 rounded-lg">
          <h4 className="text-lg font-semibold text-emerald-400">Key Takeaways</h4>
          <ul className="list-disc list-inside ml-6 text-gray-300 space-y-1">
            <li>Both Long and Short futures have unlimited potential loss if the market moves strongly against the position.</li>
            <li>Profits and losses are symmetric: one party’s gain is the other’s loss.</li>
            <li>Leverage means gains (and losses) can be much larger than the margin posted.</li>
          </ul>
        </div>
      </section>

      {/* Part 6 Futures */}
      <section id="part-14-futurs" className="scroll-mt-24 max-w-3xl mx-auto space-y-6 mb-12 w-full">
        <h2 className="text-2xl font-semibold text-emerald-400">Part 14: Why Use Futures?</h2>
        <p className="text-gray-300">
          Futures are among the most widely used instruments in global markets because they combine 
          <span className="text-emerald-400"> price certainty</span>, flexibility, and capital efficiency.
          They serve multiple purposes depending on whether you want to protect, speculate, or optimize your capital.
        </p>

        {/* Hedging */}
        <div>
          <h3 className="text-xl font-semibold text-emerald-300">Hedging – Lock in Prices and Reduce Risk</h3>
          <ul className="list-disc list-inside ml-6 space-y-2 text-gray-300">
            <li><span className="font-semibold text-white">Goal:</span> Protect against unfavorable price movements in the future.</li>
            <li><span className="font-semibold text-white">Example:</span>
              <ul className="list-disc list-inside ml-6">
                <li>A Bitcoin miner sells BTC futures to secure a fixed selling price for upcoming production.</li>
                <li>An airline buys fuel futures to protect against rising fuel costs.</li>
              </ul>
            </li>
            <li><span className="font-semibold text-white">Benefit:</span> Creates stability and predictability for revenues and expenses.</li>
          </ul>
        </div>

        {/* Speculation */}
        <div>
          <h3 className="text-xl font-semibold text-emerald-300">Speculation – Take a Directional View</h3>
          <ul className="list-disc list-inside ml-6 space-y-2 text-gray-300">
            <li><span className="font-semibold text-white">Goal:</span> Profit from anticipated price movements, up or down.</li>
            <li><span className="font-semibold text-white">How it Works:</span>
              <ul className="list-disc list-inside ml-6">
                <li>Go <span className="text-emerald-400">Long</span> if you expect prices to rise.</li>
                <li>Go <span className="text-emerald-400">Short</span> if you expect prices to fall.</li>
              </ul>
            </li>
            <li><span className="font-semibold text-white">Benefit:</span> No need to own the underlying asset; margin allows for significant exposure with less capital.</li>
          </ul>
        </div>

        {/* Arbitrage */}
        <div>
          <h3 className="text-xl font-semibold text-emerald-300">Arbitrage – Capture Market Inefficiencies</h3>
          <ul className="list-disc list-inside ml-6 space-y-2 text-gray-300">
            <li><span className="font-semibold text-white">Goal:</span> Exploit price differences between futures and spot markets (basis trading).</li>
            <li><span className="font-semibold text-white">Example:</span> Buy in the spot market and sell futures if the futures price is above fair value, then close both positions when prices converge.</li>
            <li><span className="font-semibold text-white">Benefit:</span> Generate low-risk returns when opportunities arise.</li>
          </ul>
        </div>

        {/* Price Discovery */}
        <div>
          <h3 className="text-xl font-semibold text-emerald-300">Price Discovery and Liquidity</h3>
          <ul className="list-disc list-inside ml-6 space-y-2 text-gray-300">
            <li><span className="font-semibold text-white">Goal:</span> Use futures markets to gauge fair value for forward delivery.</li>
            <li><span className="font-semibold text-white">Benefit:</span> Deep liquidity and continuous trading improve execution and market transparency.</li>
          </ul>
        </div>

        {/* Capital Efficiency */}
        <div>
          <h3 className="text-xl font-semibold text-emerald-300">Capital Efficiency with Leverage</h3>
          <ul className="list-disc list-inside ml-6 space-y-2 text-gray-300">
            <li><span className="font-semibold text-white">Goal:</span> Control large positions with a relatively small margin deposit.</li>
            <li><span className="font-semibold text-white">Benefit:</span> Free up capital for other investments or strategies.</li>
            <li><span className="font-semibold text-white">Caution:</span> Leverage amplifies both gains and losses — risk management is essential.</li>
          </ul>
        </div>

        {/* Quick Recap */}
        <div className="bg-neutral-800 p-4 rounded-lg mt-4">
          <h4 className="font-semibold text-emerald-400">Quick Recap</h4>
          <ul className="list-disc list-inside ml-6 text-gray-300">
            <li><span className="font-semibold text-white">Hedge:</span> Protect against volatility.</li>
            <li><span className="font-semibold text-white">Speculate:</span> Capture market moves.</li>
            <li><span className="font-semibold text-white">Arbitrage:</span> Exploit pricing gaps.</li>
            <li><span className="font-semibold text-white">Leverage:</span> Enhance capital efficiency, but manage risks carefully.</li>
          </ul>
        </div>
      </section>

            {/* Conclusion Futures */}
      <section id="conclusion-futures" className="scroll-mt-24 max-w-3xl mx-auto space-y-4 mb-12 w-full">
        <h2 className="text-2xl font-semibold text-emerald-400">Conclusion on futurs</h2>
        <p className="text-gray-300">
          Futures are powerful financial instruments that provide certainty in an uncertain market.
          Whether used to <span className="text-emerald-400">hedge</span> against volatility, 
          <span className="text-emerald-400"> speculate</span> on market moves, or 
          <span className="text-emerald-400"> capture arbitrage</span> opportunities, they give traders and businesses
          the ability to lock in prices, manage risk, and access liquidity with precision.
        </p>
        <p className="text-gray-300">
          However, the same leverage that makes futures capital-efficient also makes them risky — losses can be substantial if the market moves against a position.
          Successful use of futures requires not only a clear market view but also disciplined risk management.
        </p>
        <p className="text-gray-300">
          By understanding how futures work, market participants can unlock their full potential — using them as strategic tools rather than speculative gambles.
        </p>
        <p className="text-gray-300">
          With <span className="text-emerald-400 font-semibold">DeOpt V1</span>, these principles are brought into a decentralized, transparent, and permissionless environment,
          giving users direct access to futures trading without relying on centralized intermediaries.
          This evolution blends traditional market mechanics with the trustless power of blockchain.
        </p>
      </section>

      <footer className="bg-neutral-900 shadow-inner z-10 relative">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-emerald-400">
          © 2025 DeOpt. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
