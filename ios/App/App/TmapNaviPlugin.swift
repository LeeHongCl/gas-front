import Foundation
import UIKit
import Capacitor
import Combine
import TmapUISDK
import TmapNaviSDK

@objc(TmapNaviPlugin)
public class TmapNaviPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "TmapNaviPlugin"
    public let jsName = "TmapNavi"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "startNavigation", returnType: CAPPluginReturnPromise)
    ]

    private var authCancelable: Set<AnyCancellable> = []
    private var sdkInitComplete = false
    private var sdkInitStarted = false
    private var pendingInitCallbacks: [(Bool) -> Void] = []

    private func getWindow() -> UIWindow? {
        if #available(iOS 15.0, *) {
            return UIApplication.shared.connectedScenes
                .compactMap { $0 as? UIWindowScene }
                .first?.keyWindow
        } else {
            return UIApplication.shared.windows.first { $0.isKeyWindow }
        }
    }

    private func initTmapSDK(completion: @escaping (Bool) -> Void) {
        if sdkInitComplete {
            completion(true)
            return
        }

        pendingInitCallbacks.append(completion)

        if sdkInitStarted { return }
        sdkInitStarted = true

        guard let apiKey = Bundle.main.infoDictionary?["TMAP_APP_KEY"] as? String, !apiKey.isEmpty else {
            print("[TmapNaviPlugin] TMAP_APP_KEY not found in Info.plist")
            flushPendingCallbacks(success: false)
            return
        }

        let userKey = UserDefaults.standard.string(forKey: "tmap_user_key") ?? {
            let key = UUID().uuidString
            UserDefaults.standard.set(key, forKey: "tmap_user_key")
            return key
        }()
        let deviceKey = UIDevice.current.identifierForVendor?.uuidString ?? UUID().uuidString

        TmapUISDKManager.shared.stateSubject
            .receive(on: DispatchQueue.main)
            .sink { [weak self] state in
                print("[TmapNaviPlugin] stateSubject: \(state)")
                switch state {
                case .completed:
                    self?.sdkInitComplete = true
                    self?.flushPendingCallbacks(success: true)
                case .authError(_):
                    self?.sdkInitStarted = false
                    self?.flushPendingCallbacks(success: false)
                case .dismissReq, .dismissNRequestPermission(_):
                    self?.bridge?.viewController?.dismiss(animated: true)
                default:
                    break
                }
            }.store(in: &authCancelable)

        var initOption = UISDKInitOption()
        initOption.clientDeviceId = UUID().uuidString
        initOption.clientApiKey = apiKey
        initOption.userKey = userKey
        initOption.deviceKey = deviceKey
        initOption.uiWindow = getWindow()

        TmapUISDKManager.shared.initSDK(initOption: initOption)
    }

    private func flushPendingCallbacks(success: Bool) {
        let callbacks = pendingInitCallbacks
        pendingInitCallbacks.removeAll()
        callbacks.forEach { $0(success) }
    }

    @objc func startNavigation(_ call: CAPPluginCall) {
        let destLat   = call.getDouble("destLat")   ?? 0
        let destLng   = call.getDouble("destLng")   ?? 0
        let destName  = call.getString("destName")  ?? "목적지"
        let startLat  = call.getDouble("startLat")
        let startLng  = call.getDouble("startLng")
        let startName = call.getString("startName")
        let viaLat    = call.getDouble("viaLat")
        let viaLng    = call.getDouble("viaLng")
        let viaName   = call.getString("viaName")

        DispatchQueue.main.async { [weak self] in
            self?.initTmapSDK { success in
                guard success else {
                    call.reject("T-map SDK 초기화 실패")
                    return
                }
                guard let vc = TmapUISDKManager.shared.getViewController() else {
                    call.reject("T-map ViewController를 가져올 수 없습니다.")
                    return
                }

                let destination = Point(longitude: destLng, latitude: destLat, name: destName)
                let origin: Point? = (startLat != nil && startLng != nil)
                    ? Point(longitude: startLng!, latitude: startLat!, name: startName ?? "출발지")
                    : nil

                vc.modalPresentationStyle = .fullScreen
                self?.bridge?.viewController?.present(vc, animated: true) {
                    if let viaLat = viaLat, let viaLng = viaLng {
                        let wayPoint = Point(longitude: viaLng, latitude: viaLat, name: viaName ?? "경유지")
                        TmapUISDKManager.shared.requestRoute(origin: origin, destination: destination, wayPoints: [wayPoint], guideWithoutPreview: true)
                    } else {
                        TmapUISDKManager.shared.requestRoute(origin: origin, destination: destination, guideWithoutPreview: true)
                    }
                }

                call.resolve()
            }
        }
    }
}
