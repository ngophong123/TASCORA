"use client"

import { useEffect, useRef, type ReactNode } from "react"

/** Homepage-only progressive enhancement; server content is never hidden. */
export function HomeCinema({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = root.current
    if (!element) return
    let disposed = false
    let generation = 0
    let teardown = () => {}
    let cancelActivation = () => {}
    let engaged = false
    const preference = matchMedia("(prefers-reduced-motion: reduce)")
    const desktop = matchMedia("(min-width: 1024px) and (pointer: fine)")
    async function synchronize() {
      const current = ++generation
      teardown()
      teardown = () => {}
      if (preference.matches) return
      try {
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ])
        if (disposed || current !== generation || preference.matches || !element) return
        gsap.registerPlugin(ScrollTrigger)
        // Registration enables the plugin once. Stop that scheduler before
        // enabling it for our first registration batch; double enable would
        // replace the interval handle and leave an orphan sync interval.
        ScrollTrigger.disable(false, false)
        const previousAutoSleep = gsap.config().autoSleep
        gsap.config({ autoSleep: 12 })
        const device = navigator as Navigator & {
          deviceMemory?: number
          connection?: { saveData?: boolean }
        }
        const full =
          desktop.matches &&
          !device.connection?.saveData &&
          (device.deviceMemory === undefined || device.deviceMemory >= 4) &&
          (!device.hardwareConcurrency || device.hardwareConcurrency >= 4)
        element.dataset.cinemaMode = full ? "full" : "light"
        const styles = new Map<HTMLElement, string | null>()
        const remember = (target: HTMLElement) => {
          if (!styles.has(target)) styles.set(target, target.getAttribute("style"))
        }
        const triggers: ReturnType<typeof ScrollTrigger.create>[] = []
        const scenes = new Map<
          ReturnType<typeof ScrollTrigger.create>,
          { target: HTMLElement; redraw: () => void }
        >()
        let triggerId = 0
        const owned = new WeakSet<HTMLElement>()
        const motion = (
          target: HTMLElement,
          trigger: HTMLElement,
          start: string,
          end: string,
          draw: (progress: number, focused: boolean) => void
        ) => {
          remember(target)
          const instance = ScrollTrigger.create({
            id: `tascora-home-${triggerId++}`,
            trigger,
            start,
            end,
            scrub: true,
            onUpdate: (self) => draw(self.progress, target.contains(document.activeElement)),
            onRefresh: (self) => draw(self.progress, target.contains(document.activeElement)),
          })
          triggers.push(instance)
          scenes.set(instance, {
            target,
            redraw: () => draw(instance.progress, target.contains(document.activeElement)),
          })
        }
        const ease = gsap.parseEase("power2.out")
        const translate = (
          target: HTMLElement,
          section: HTMLElement,
          distance: number,
          index = 0
        ) => {
          if (owned.has(target)) return
          owned.add(target)
          remember(target)
          const y = gsap.quickSetter(target, "y", "px")
          motion(
            target,
            section,
            `top ${88 - Math.min(index, 5) * 3}%`,
            "top 32%",
            (progress, focused) => {
              y(focused ? 0 : distance * (1 - ease(progress)))
            }
          )
        }
        // Public API content arrives after hydration: register new nodes once.
        const registerScenes = () => {
          ScrollTrigger.enable()
          for (let index = triggers.length - 1; index >= 0; index--) {
            const trigger = triggers[index]
            if (
              trigger &&
              (!trigger.trigger?.isConnected || !scenes.get(trigger)?.target.isConnected)
            ) {
              trigger.kill(false)
              scenes.delete(trigger)
              triggers.splice(index, 1)
            }
          }
          styles.forEach((style, target) => {
            if (!target.isConnected) {
              if (style === null) target.removeAttribute("style")
              else target.setAttribute("style", style)
              styles.delete(target)
              owned.delete(target)
            }
          })
          const hero = element.querySelector<HTMLElement>("[data-cinema-hero]")
          const panel = element.querySelector<HTMLElement>("[data-cinema-depth]")
          if (hero && panel && !owned.has(panel)) {
            owned.add(panel)
            remember(panel)
            const y = gsap.quickSetter(panel, "y", "px")
            motion(panel, hero, "top top", "bottom top", (progress, focused) =>
              y(focused ? 0 : progress * (full ? -52 : -8))
            )
          }
          const image = element.querySelector<HTMLElement>("[data-cinema-hero-image]")
          if (hero && image && !owned.has(image)) {
            owned.add(image)
            remember(image)
            const scaleX = gsap.quickSetter(image, "scaleX")
            const scaleY = gsap.quickSetter(image, "scaleY")
            const y = gsap.quickSetter(image, "yPercent")
            motion(image, hero, "top top", "bottom top", (progress) => {
              const scale = 1 + progress * (full ? 0.2 : 0.04)
              scaleX(scale)
              scaleY(scale)
              y(progress * (full ? 6 : 1))
            })
          }
          const featured = element.querySelector<HTMLElement>("[data-cinema-featured]")
          if (featured) {
            const heading = featured.querySelector<HTMLElement>("[data-cinema-depth]")
            if (heading) translate(heading, featured, full ? 36 : 8)
            featured
              .querySelectorAll<HTMLElement>(".cinema-service-frame")
              .forEach((card, index) => {
                translate(card, card, full ? 40 + (index % 3) * 14 : 8, index % 3)
              })
          }
          const categories = element.querySelector<HTMLElement>("[data-cinema-categories]")
          categories
            ?.querySelectorAll<HTMLElement>("[data-cinema-category]")
            .forEach((card, index) => {
              translate(card, card, full ? 20 : 6, index % 4)
            })
          const talent = element.querySelector<HTMLElement>("[data-cinema-talent]")
          if (talent) {
            const title = talent.querySelector<HTMLElement>("[data-cinema-talent-title]")
            if (title) translate(title, talent, full ? 30 : 8)
            talent.querySelectorAll<HTMLElement>("[data-cinema-profile]").forEach((card, index) => {
              translate(card, card, full ? 48 : 8, index)
            })
          }
          const workflow = element.querySelector<HTMLElement>("[data-cinema-workflow]")
          if (workflow && !owned.has(workflow)) {
            owned.add(workflow)
            const steps = Array.from(workflow.querySelectorAll<HTMLElement>("[data-cinema-step]"))
            steps.forEach(remember)
            motion(workflow, workflow, "top 75%", "bottom 35%", (progress) => {
              workflow.style.setProperty("--cinema-progress", String(progress))
              steps.forEach((step, index) => {
                step.style.setProperty(
                  "--step-progress",
                  String(Math.min(1, Math.max(0, progress * 3 - index)))
                )
                step.dataset.cinemaActive = String(index === Math.min(2, Math.floor(progress * 3)))
              })
            })
          }
          const finale = element.querySelector<HTMLElement>("[data-cinema-finale]")
          const finaleTitle = finale?.querySelector<HTMLElement>("[data-cinema-finale-title]")
          if (finale && finaleTitle) translate(finaleTitle, finale, full ? 40 : 8)
          // 3.15's global browser workaround runs RAF continuously. Disable
          // global scheduling, enable only our instances, and drive update/refresh
          // from native events. No pins/snaps/timed tweens need a plugin loop.
          ScrollTrigger.disable(false, false)
          triggers.forEach((trigger) => trigger.enable(false, false))
          element.dataset.cinemaTriggers = String(triggers.length)
        }
        let frame: number | null = null
        let refreshNeeded = true
        let registerNeeded = true
        let focusNeeded = false
        const render = () => {
          frame = null
          if (document.hidden) return
          if (registerNeeded) {
            registerNeeded = false
            registerScenes()
          }
          if (refreshNeeded) {
            refreshNeeded = false
            ScrollTrigger.refresh()
          }
          ScrollTrigger.update()
          if (focusNeeded) {
            focusNeeded = false
            scenes.forEach((scene) => scene.redraw())
          }
        }
        const schedule = () => {
          if (frame === null && !document.hidden) frame = requestAnimationFrame(render)
        }
        const refresh = () => {
          refreshNeeded = true
          schedule()
        }
        // Focus changes transforms, not document geometry. Avoid a full GSAP
        // measurement/refresh on every Tab through marketplace actions.
        const focus = () => {
          focusNeeded = true
          schedule()
        }
        const visibility = () => {
          if (document.hidden && frame !== null) {
            cancelAnimationFrame(frame)
            frame = null
          } else refresh()
        }
        const resize = new ResizeObserver(refresh)
        resize.observe(element)
        const mutation = new MutationObserver(() => {
          registerNeeded = true
          refresh()
        })
        mutation.observe(element, { childList: true, subtree: true })
        window.addEventListener("scroll", schedule, { passive: true })
        window.addEventListener("resize", refresh)
        element.addEventListener("load", refresh, true)
        element.addEventListener("focusin", focus)
        element.addEventListener("focusout", focus)
        document.addEventListener("visibilitychange", visibility)
        document.fonts.addEventListener("loadingdone", refresh)
        schedule()
        teardown = () => {
          if (frame !== null) cancelAnimationFrame(frame)
          resize.disconnect()
          mutation.disconnect()
          window.removeEventListener("scroll", schedule)
          window.removeEventListener("resize", refresh)
          element.removeEventListener("load", refresh, true)
          element.removeEventListener("focusin", focus)
          element.removeEventListener("focusout", focus)
          document.removeEventListener("visibilitychange", visibility)
          document.fonts.removeEventListener("loadingdone", refresh)
          triggers.forEach((trigger) => trigger.kill(false))
          ScrollTrigger.disable(false, false)
          styles.forEach((style, target) => {
            if (style === null) target.removeAttribute("style")
            else target.setAttribute("style", style)
            delete target.dataset.cinemaActive
          })
          scenes.clear()
          styles.clear()
          gsap.config({ autoSleep: previousAutoSleep })
          delete element.dataset.cinemaMode
          delete element.dataset.cinemaTriggers
        }
      } catch {
        // Failed enhancement chunks leave the static marketplace usable.
        teardown()
      }
    }
    const requestSynchronization = () => {
      // Invalidate an import still resolving when preferences or viewport change.
      ++generation
      cancelActivation()
      teardown()
      teardown = () => {}
      if (preference.matches) return
      // Mobile scene measurement competes with hydration even though the user
      // has not started the scroll story. Keep static content interactive and
      // load the same light choreography on actual scroll intent, not a timer.
      // Restored/deep scroll positions must initialize immediately.
      if (engaged || desktop.matches || window.scrollY > 0) {
        engaged = true
        void synchronize()
        return
      }
      element.dataset.cinemaPending = "true"
      const activate = () => {
        engaged = true
        cancelActivation()
        void synchronize()
      }
      const key = (event: KeyboardEvent) => {
        const target = event.target instanceof Element ? event.target : null
        if (target?.closest("input, textarea, select, [contenteditable='true']")) return
        if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key))
          activate()
      }
      window.addEventListener("wheel", activate, { passive: true })
      window.addEventListener("touchmove", activate, { passive: true })
      window.addEventListener("scroll", activate, { passive: true })
      window.addEventListener("keydown", key)
      cancelActivation = () => {
        window.removeEventListener("wheel", activate)
        window.removeEventListener("touchmove", activate)
        window.removeEventListener("scroll", activate)
        window.removeEventListener("keydown", key)
        delete element.dataset.cinemaPending
        cancelActivation = () => {}
      }
    }
    requestSynchronization()
    preference.addEventListener("change", requestSynchronization)
    desktop.addEventListener("change", requestSynchronization)
    return () => {
      disposed = true
      preference.removeEventListener("change", requestSynchronization)
      desktop.removeEventListener("change", requestSynchronization)
      cancelActivation()
      teardown()
    }
  }, [])
  return (
    <div ref={root} className="home-cinema">
      {children}
    </div>
  )
}
