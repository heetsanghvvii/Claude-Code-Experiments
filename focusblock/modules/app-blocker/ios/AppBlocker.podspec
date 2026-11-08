Pod::Spec.new do |s|
  s.name           = 'AppBlocker'
  s.version        = '0.1.0'
  s.summary        = 'Screen Time app blocking for FocusBlock'
  s.description    = 'Screen Time app blocking for FocusBlock'
  s.license        = 'MIT'
  s.author         = 'FocusBlock'
  s.homepage       = 'https://example.com'
  s.platforms      = { :ios => '16.4' }
  s.swift_version  = '5.9'
  s.source         = { git: 'https://example.com/focusblock.git' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.source_files = "**/*.{h,m,swift}"
  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES' }
end
