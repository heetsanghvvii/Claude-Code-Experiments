import ExpoModulesCore
import FamilyControls
import ManagedSettings
import SwiftUI

private let selectionKey = "focusblock.selection"
private let onKey = "focusblock.on"

private func loadSelection() -> FamilyActivitySelection {
  guard let data = UserDefaults.standard.data(forKey: selectionKey),
        let sel = try? JSONDecoder().decode(FamilyActivitySelection.self, from: data)
  else { return FamilyActivitySelection() }
  return sel
}

private func saveSelection(_ sel: FamilyActivitySelection) {
  if let data = try? JSONEncoder().encode(sel) {
    UserDefaults.standard.set(data, forKey: selectionKey)
  }
}

private func apply(_ on: Bool) {
  let store = ManagedSettingsStore()
  if on {
    let sel = loadSelection()
    store.shield.applications = sel.applicationTokens.isEmpty ? nil : sel.applicationTokens
    store.shield.applicationCategories = sel.categoryTokens.isEmpty
      ? nil : ShieldSettings.ActivityCategoryPolicy.specific(sel.categoryTokens)
    store.shield.webDomains = sel.webDomainTokens.isEmpty ? nil : sel.webDomainTokens
  } else {
    store.clearAllSettings()
  }
}

private struct PickerView: View {
  @State var selection: FamilyActivitySelection
  let onDone: (FamilyActivitySelection) -> Void
  var body: some View {
    NavigationView {
      FamilyActivityPicker(selection: $selection)
        .navigationTitle("Apps to block")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
          ToolbarItem(placement: .confirmationAction) {
            Button("Done") { onDone(selection) }
          }
        }
    }
  }
}

public class AppBlockerModule: Module {
  public func definition() -> ModuleDefinition {
    Name("AppBlocker")

    AsyncFunction("hasPermission") { () -> Bool in
      return AuthorizationCenter.shared.authorizationStatus == .approved
    }

    AsyncFunction("requestPermission") { (promise: Promise) in
      Task {
        do {
          try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
          promise.resolve(AuthorizationCenter.shared.authorizationStatus == .approved)
        } catch {
          promise.resolve(false)
        }
      }
    }

    AsyncFunction("getInstalledApps") { () -> [[String: String]] in [] }

    Function("setBlockedApps") { (_ ids: [String]) in }

    AsyncFunction("pickApps") { (promise: Promise) in
      DispatchQueue.main.async {
        guard let top = UIApplication.shared.connectedScenes
          .compactMap({ ($0 as? UIWindowScene)?.keyWindow?.rootViewController }).first
        else { promise.resolve(0); return }
        var presenter = top
        while let next = presenter.presentedViewController { presenter = next }
        let host = UIHostingController(rootView: PickerView(selection: loadSelection()) { sel in
          saveSelection(sel)
          if UserDefaults.standard.bool(forKey: onKey) { apply(true) }
          let count = sel.applicationTokens.count + sel.categoryTokens.count + sel.webDomainTokens.count
          presenter.dismiss(animated: true) { promise.resolve(count) }
        })
        presenter.present(host, animated: true)
      }
    }

    Function("setBlocking") { (on: Bool) in
      UserDefaults.standard.set(on, forKey: onKey)
      apply(on)
    }

    Function("isBlocking") { () -> Bool in
      return UserDefaults.standard.bool(forKey: onKey)
    }

    // ---- Android-only features: iOS stubs with sensible defaults ----
    // iOS uses Screen Time (FamilyControls); there is no detection mode or strict mode.

    Function("setMode") { (_ mode: String) in }

    Function("getMode") { () -> String in
      return "accessibility"
    }

    Function("setStrictMode") { (_ on: Bool) in }

    Function("getStrictMode") { () -> Bool in
      return false
    }

    AsyncFunction("getDiagnostics") { () -> [String: Any] in
      let approved = AuthorizationCenter.shared.authorizationStatus == .approved
      let major = ProcessInfo.processInfo.operatingSystemVersion.majorVersion
      return [
        "accessibilityEnabled": approved,
        "usageAccessGranted": approved,
        "overlayGranted": true,
        "batteryOptimizationIgnored": true,
        "manufacturer": "Apple",
        "brand": "Apple",
        "model": UIDevice.current.model,
        "sdk": major,
        "mode": "accessibility",
        "strictMode": false,
        "serviceAlive": approved,
        "lastHeartbeat": 0,
        "blockingHealthy": approved,
        "strictModeAvailable": false,
      ]
    }

    AsyncFunction("requestAccessibility") { () -> Bool in false }
    AsyncFunction("requestUsageAccess") { () -> Bool in false }
    AsyncFunction("requestOverlay") { () -> Bool in true }
    AsyncFunction("requestIgnoreBatteryOptimization") { () -> Bool in true }

    AsyncFunction("openAppDetails") { () -> Bool in
      DispatchQueue.main.async {
        if let url = URL(string: UIApplication.openSettingsURLString) {
          UIApplication.shared.open(url)
        }
      }
      return true
    }
  }
}
