// context/mod.rs
mod providers;
mod registry;

pub(crate) use providers::get_device_display_name;
pub use providers::initialize_context;
// ContextInitResult is used internally but not exported
pub use registry::ServiceContext;
